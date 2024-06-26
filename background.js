/*


 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

console.log("background.js");

// The browser action

function launch(){
    var data = {url:"html/domestic.html"}
    browser.tabs.create(data); 
}


browser.browserAction.onClicked.addListener(launch);

// For sumofus_main.js

function redirect(requestDetails) {
	console.log("Redirecting: " + requestDetails.url);
	return {
		redirectUrl: "https://www.sumofus.org/campaigns/"
	};
}

browser.webRequest.onBeforeRequest.addListener(
	redirect,
	{urls: ["http://www.sumofus.org/"]},
 	["blocking"]
);

// Prevent google scripts from breaking the google drive add-on
var block_urls = ["*://docs.google.com/*"];
function cancel(requestDetails) {
  console.log("[google docs] Canceling: " + requestDetails.url);
  return {cancel: true};
}

browser.webRequest.onBeforeRequest.addListener(
	cancel,             // function
	{urls: block_urls, types: ["script"]},
	["blocking"]
);
const oldReddit = "https://old.reddit.com";
const excludedPaths = [
  /^\/media/,
  /^\/poll/,
  /^\/rpan/,
  /^\/settings/,
  /^\/topics/,
  /^\/community-points/,
  /^\/r\/[a-zA-Z0-9_]+\/s\/.*/, // eg https://reddit.com/r/comics/s/TjDGhcl22d
  /^\/appeals?/,
  /\/r\/.*\/s\//,
];

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    const url = new URL(details.url);

    if (url.hostname === "old.reddit.com") return;

    for (const path of excludedPaths) {
      if (path.test(url.pathname)) return;
    }

    if (url.pathname.indexOf("/gallery") === 0) {
      return {
        redirectUrl:
          oldReddit + "/comments" + url.pathname.slice("/gallery".length),
      };
    }

    return { redirectUrl: oldReddit + url.pathname + url.search + url.hash };
  },
  {
    urls: [
      "*://reddit.com/*",
      "*://www.reddit.com/*",
      "*://np.reddit.com/*",
      "*://amp.reddit.com/*",
      "*://i.reddit.com/*",
    ],
    types: [
      "main_frame",
      "sub_frame",
      "stylesheet",
      "script",
      "image",
      "object",
      "xmlhttprequest",
      "other",
    ],
  },
  ["blocking"],
);

// Prevent reddit from rendering raw image URLs as HTML
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    const url = new URL(details.url);

    const imageUrlHostnames = ["preview.redd.it", "i.redd.it"];

    for (const hostname of imageUrlHostnames) {
      if (url.hostname === hostname) {
        const headers = details.requestHeaders.filter(
          (h) => h.name.toLowerCase() !== "accept",
        );
        return { requestHeaders: headers };
      }
    }
  },
  {
    urls: ["*://i.redd.it/*", "*://preview.redd.it/*"],
    types: [
      "main_frame",
      "sub_frame",
      "stylesheet",
      "script",
      "image",
      "object",
      "xmlhttprequest",
      "other",
    ],
  },
  ["blocking", "requestHeaders"],
);