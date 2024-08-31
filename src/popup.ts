chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    var activeTabId = activeTab.id;

    chrome.storage.local.set({ sidepanelTabId: activeTabId }, () => {
        console.log("Tab id stored: ", activeTabId);
    });
});