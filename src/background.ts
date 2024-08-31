// @ts-nocheck
// @ts-ignore

let currentTab: chrome.tabs.Tab | null = null;
let sidePanelState: boolean = false;

// When extension is installed
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
    chrome.contextMenus.create({
        id: "selectionContextMenu",
        title: "Send to agent.ai",
        contexts: ["selection"],
    });

    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }, () => {
        console.log("Sidepanel behavior set");
    });

    chrome.storage.local.remove("sidepanelTabId", () => {
        const error = chrome.runtime.lastError;
        if (error) console.error(error);
        else console.log("Removed sidepanelTabId from storage");
    });
});

// When extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    console.log("Extension icon clicked");
    currentTab = tab;
    openSidepanel();
});

// when context menu is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "selectionContextMenu") {
        if (!sidePanelState) {
            openSidepanel();
            
        } else {
            chrome.runtime.sendMessage({ action: 'postMessage', data: info.selectionText }, (response) => {
                console.log(response);
            });
        }
    }
});

function openSidepanel() {
    console.log("Attempting to open sidepanel");
    if (!currentTab || !currentTab.id) {
        console.error("No current tab");
        return;
    }

    chrome.sidePanel.setOptions({
        tabId: currentTab.id,
        path: 'sidepanel.html',
        enabled: true
    }, () => {
        console.log("Sidepanel options set for tab:", currentTab.id);
        
        // Force open the sidepanel using callback
        chrome.sidePanel.open({ tabId: currentTab.id }, () => {
            console.log("Sidepanel opened for tab:", currentTab.id);
            
            sidePanelState = true;
            chrome.storage.local.set({ sidepanelTabId: currentTab.id }, () => {
                console.log("Stored sidepanelTabId:", currentTab.id);
            });
        
            console.log("Sidepanel current tab url: ", currentTab.url)
        
            // Add a delay before sending the URL
            setTimeout(() => {
                chrome.runtime.sendMessage({ 
                    action: 'postMessage', 
                    data: `URL:${currentTab.url}` 
                }, (response) => {
                    console.log("URL sent to sidepanel:", response);
                });
            }, 5000); // 5 second delay
        });
    });
}


// When tabs are updated or activated
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        console.log("Tab activated:", activeInfo.tabId);
        currentTab = tab;
        updateSidepanelState();
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        console.log("Tab updated:", tabId);
        currentTab = tab;
        updateSidepanelState();
    }
});

function updateSidepanelState() {
    if (!currentTab || !currentTab.id) {
        console.error("No current tab in updateSidepanelState");
        return;
    }

    chrome.sidePanel.getOptions({ tabId: currentTab.id }, (sidepanelInfo) => {
        sidePanelState = !sidepanelInfo.enabled;
        console.log("Sidepanel state updated:", sidePanelState);

        if (sidePanelState) {
            chrome.storage.local.set({ sidepanelTabId: currentTab.id }, () => {
                console.log("Updated sidepanelTabId in storage:", currentTab);
            });
        }
    });
}

// Listen to manual sidepanel close
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'agent_ai_sidepanel') {
        console.log("Sidepanel connected");
        port.onDisconnect.addListener(() => {
            console.log("Sidepanel disconnected");
            chrome.storage.local.remove("sidepanelTabId", () => {
                const error = chrome.runtime.lastError;
                if (error) console.error(error);
                else console.log("Removed sidepanelTabId from storage");
            });
            sidePanelState = false;
            if (currentTab && currentTab.id) {
                chrome.sidePanel.setOptions({
                    tabId: currentTab.id,
                    enabled: false,
                }, () => {
                    console.log("Sidepanel disabled for tab:", currentTab.id);
                });
            }
        });
    }
});

// Listen for messages from the sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sidepanelReady') {
        console.log("Sidepanel is ready");
        sendResponse({ status: "acknowledged" });
    }
});