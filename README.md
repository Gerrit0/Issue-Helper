# Issue-Helper
Quickly move issues between repositories

While other tools like this exist, I wanted a quick way to do almost the same thing without needing to leave the page. If you need more features I'd advise looking into either [Google's script](https://github.com/google/github-issue-mover) or [IQAndreas's script](https://github.com/IQAndreas/github-issues-import)

### Installation
1. Install [tampermonkey](https://tampermonkey.net/) or [greasemonkey](http://www.greasespot.net/)
2. Click [here](https://github.com/Gerrit0/Issue-Helper/raw/master/issue_mover.user.js)
3. Click Install
4. Go [here](https://github.com/settings/tokens) and create a new token. `public_repo` or `repo` must be selected.
5. Copy your token into the script's config.

### FAQ
Why do you load the script on EVERY page on GitHub?
- GitHub uses AJAX to load different pages, and thus only loading the script on issue pages will fail. For this same reason, the script checks if it should display itself every half second.
