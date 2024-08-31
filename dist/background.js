(()=>{"use strict";var e=null,o=!1;function n(){console.log("Attempting to open sidepanel"),e&&e.id?chrome.sidePanel.setOptions({tabId:e.id,path:"sidepanel.html",enabled:!0},(function(){console.log("Sidepanel options set for tab:",e.id),chrome.sidePanel.open({tabId:e.id},(function(){console.log("Sidepanel opened for tab:",e.id),o=!0,chrome.storage.local.set({sidepanelTabId:e.id},(function(){console.log("Stored sidepanelTabId:",e.id)})),console.log("Sidepanel current tab url: ",e.url),setTimeout((function(){chrome.runtime.sendMessage({action:"postMessage",data:"URL:".concat(e.url)},(function(e){console.log("URL sent to sidepanel:",e)}))}),5e3)}))})):console.error("No current tab")}function t(){e&&e.id?chrome.sidePanel.getOptions({tabId:e.id},(function(n){o=!n.enabled,console.log("Sidepanel state updated:",o),o&&chrome.storage.local.set({sidepanelTabId:e.id},(function(){console.log("Updated sidepanelTabId in storage:",e)}))})):console.error("No current tab in updateSidepanelState")}chrome.runtime.onInstalled.addListener((function(){console.log("Extension installed"),chrome.contextMenus.create({id:"selectionContextMenu",title:"Send to agent.ai",contexts:["selection"]}),chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:!0},(function(){console.log("Sidepanel behavior set")})),chrome.storage.local.remove("sidepanelTabId",(function(){var e=chrome.runtime.lastError;e?console.error(e):console.log("Removed sidepanelTabId from storage")}))})),chrome.action.onClicked.addListener((function(o){console.log("Extension icon clicked"),e=o,n()})),chrome.contextMenus.onClicked.addListener((function(e,t){"selectionContextMenu"===e.menuItemId&&(o?chrome.runtime.sendMessage({action:"postMessage",data:e.selectionText},(function(e){console.log(e)})):n())})),chrome.tabs.onActivated.addListener((function(o){chrome.tabs.get(o.tabId,(function(n){console.log("Tab activated:",o.tabId),e=n,t()}))})),chrome.tabs.onUpdated.addListener((function(o,n,a){"complete"===n.status&&a.active&&(console.log("Tab updated:",o),e=a,t())})),chrome.runtime.onConnect.addListener((function(n){"agent_ai_sidepanel"===n.name&&(console.log("Sidepanel connected"),n.onDisconnect.addListener((function(){console.log("Sidepanel disconnected"),chrome.storage.local.remove("sidepanelTabId",(function(){var e=chrome.runtime.lastError;e?console.error(e):console.log("Removed sidepanelTabId from storage")})),o=!1,e&&e.id&&chrome.sidePanel.setOptions({tabId:e.id,enabled:!1},(function(){console.log("Sidepanel disabled for tab:",e.id)}))})))})),chrome.runtime.onMessage.addListener((function(e,o,n){"sidepanelReady"===e.action&&(console.log("Sidepanel is ready"),n({status:"acknowledged"}))}))})();