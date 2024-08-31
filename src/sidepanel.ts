var iWindow: any;
var activeTab: any;
const AGENT_AI_AUTH_LINK = 'https://agent.ai/api/auth/login';
var cookieCheckInterval: any;
var redirectedForAuth = false;
var authTabId: any;
console.log("CLICKED")

// when sidepanel opens for first time
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    activeTab = tabs[0];
    chrome.storage.local.set({ sidepanelTabId: activeTab.id }, () => {
        console.log("Tab id stored: ", activeTab.id);
    });
});

// to detect when sidepanel is closed manually
chrome.runtime.connect({ name: 'agent_ai_sidepanel' });

// chrome.runtime.sendMessage({ action: 'sidepanelReady' }, (response) => {
//     console.log("Sidepanel ready message acknowledged:", response);
// });

function login() {
    if (!redirectedForAuth) {
        chrome.tabs.create({ url: AGENT_AI_AUTH_LINK }, function (tab) {
            authTabId = tab.id;
        });
        redirectedForAuth = true;
    }
}


function init() {
    cookieCheckInterval = setInterval(() => {
        console.log("checking");
        chrome.cookies.getAll({ domain: "agent.ai" }, (cookies) => {
            console.log(cookies);
            if (chrome.runtime.lastError) console.error(chrome.runtime.lastError.message);
            else {
                if (!cookies) {
                    console.log("No cookies found", cookies)
                    login();
                    return;
                }

                const appSession = cookies.find(cookie => cookie.name === "appSession");
                if (appSession) {
                    chrome.cookies.set({
                        name: appSession.name,
                        value: appSession.value,
                        url: activeTab.url
                    }, (cookie) => {
                        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError.message);
                        else {
                            // success
                            console.log("cookie set");
                            if (authTabId) chrome.tabs.remove(authTabId, function () {
                                console.log('Closed tab with ID:', authTabId);
                            });

                            clearInterval(cookieCheckInterval);
                            showIframe();
                        }
                    });

                } else login();
            }
        });
    }, 1000);
}

function showIframe() {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", "https://agent.ai/");
    iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation allow-top-navigation-by-user-activation");
    document.body.appendChild(iframe);
    iWindow = iframe.contentWindow;
}


init();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("SIDEPANEL MESSAGE", message);
    if (message.action === "postMessage") {
        if (iWindow) {
            if (message.data.startsWith("URL:")) {
                // This is a URL update
                const url = message.data; // can Remove the "URL:" prefix here
                console.log("Received URL in sidepanel:", url); 
                iWindow.postMessage(url, '*');
            } else {
                // This is a regular message
                iWindow.postMessage(message.data, '*');
            }
        }
        sendResponse({ status: true });
    }
});
