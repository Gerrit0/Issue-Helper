// ==UserScript==
// @name        Issue Mover
// @description	Quickly copy issues to repos you have push access to.
// @author		Gerrit0
// @homepage	https://github.com/Gerrit0/Issue-Helper
// @include     https://github.com/*
// @version     1.0
// @grant       none
// @run-at		document-idle
// ==/UserScript==

/*jshint
    esnext: true
*/

let mover = () => {
	let config = {
		token: '', //Generate a key at https://github.com/settings/tokens, public_repo or repo must be selected
		ignore: ['com/(?!Gerrit0)'], //Urls to ignore. Regex supported. Example: ['Gerrit0/Issue-mover', 'Gerrit0/Test*']
		template: `### This issue has been imported from [here]({url}).
Originally created by @{poster}

--
{content}`,
	};

	if (config.ignore.some((ign) => document.location.href.match(new RegExp(ign, 'i')))) {
		return;
	}

	let ajax = (function() {
		function makeParamString(params) {
			if (typeof params == 'object') {
				return Object.keys(params)
						.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
						.join('&');
			}
			return params;
		}

		function xhr(protocol, url = '/', params = {}, headers = {}) {
			var paramStr = makeParamString(params);
			return new Promise(function(resolve, reject) {
				var xhr = new XMLHttpRequest();
				xhr.open(protocol, url);

				if (protocol == 'POST') {
					xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				}

				Object.keys(headers).forEach(key => {
					xhr.setRequestHeader(key, headers[key]);
				});

				xhr.onload = function() {
					if (xhr.status == 200) {
						resolve(xhr.response);
					} else {
						reject(Error(xhr.statusText));
					}
				};
				// Handle network errors
				xhr.onerror = function() {
					reject(Error("Network Error"));
				};

				if (paramStr) {
					xhr.send(paramStr);
				} else {
					xhr.send();
				}
			});
		}

		function get(url = '/', params = {}, headers = {}) {
			return xhr('GET', `${url}?${makeParamString(params)}`, undefined, headers);
		}

		function post(url = '/', params = {}, headers = {}) {
			return xhr('POST', url, params, headers);
		}

		function getJSON(url = '/', params = {}, headers = {}) {
			return get(url, params, headers)
					.then((resp) => JSON.parse(resp));
		}

		 function postJSON(url = '/', params = {}, headers = {}) {
			return post(url, params, headers)
					.then((resp) => JSON.parse(resp));
		}

		return {xhr, get, post, getJSON, postJSON};
	}());

	let handleMoves = (event) => {
		ajax.getJSON(`https://api.github.com/repos/${document.location.href.substr(19)}`,
			{},
			{ Authorization: `token ${config.token}` })
		.then((resp) => {
			let body = config.template.replace(/{url}/gi, document.location.href)
							.replace(/{poster}/gi, resp.user.login)
							.replace(/{content}/gi, resp.body);
			return ajax.postJSON(`https://api.github.com/repos/${event.target.dataset.repo}/issues`,
				JSON.stringify({title: resp.title, body}),
				{Authorization: `token ${config.token}`});
		})
		.catch((err) => {console.log(err);});
	};

	ajax.getJSON('https://api.github.com/user/repos', {}, { Authorization: `token ${config.token}` })
		.then(resp => {
            let repos = Array.from(resp).filter(repo => repo.has_issues);
			let lis = '';
	        repos.forEach(repo => {
				let name = repo.name;
				if (repo.name.length > 20) {
					name = `${repo.name.substr(0, 17)}...`;
				}
				lis += `<a class="dropdown-item" data-repo="${repo.full_name}">${name}</a>`;
			});
			document.querySelector('.gh-header-actions').innerHTML += `
			<style>
				#im .dropdown-item { border: 0; background: transparent; color: #000; }
				#im .dropdown-item:hover {color: #fff; background-color: #4078c0; }
			</style>
			<div id="im" class="dropdown js-menu-container" style="float:left;">
				<button type="button" class="js-menu-target btn btn-sm" tabindex="-1">
					Move issue to...
					<span class="dropdown-caret"></span>
				</button>
				<div class="dropdown-menu-content js-menu-content">
					<ul class="dropdown-menu dropdown-menu-s">
						${lis}
					</ul>
				</div>
			</div>`;

			document.querySelector('#im .dropdown-menu').addEventListener('click', handleMoves);
		})
		.catch(err => console.error(err));
};

setInterval(() => {
	if (!document.querySelector('#im') && document.querySelector('#show_issue')) {
		mover();
	}
}, 500);
