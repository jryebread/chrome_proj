(()=>{"use strict";var e,o,t,n,a=!1;function s(){a||(chrome.tabs.create({url:"https://agent.ai/api/auth/login"},(function(e){n=e.id})),a=!0)}console.log("CLICKED"),chrome.tabs.query({active:!0,currentWindow:!0},(function(e){o=e[0],chrome.storage.local.set({sidepanelTabId:o.id},(function(){console.log("Tab id stored: ",o.id)}))})),chrome.runtime.connect({name:"agent_ai_sidepanel"}),t=setInterval((function(){console.log("checking"),chrome.cookies.getAll({domain:"agent.ai"},(function(a){if(console.log(a),chrome.runtime.lastError)console.error(chrome.runtime.lastError.message);else{if(!a)return console.log("No cookies found",a),void s();var r=a.find((function(e){return"appSession"===e.name}));r?chrome.cookies.set({name:r.name,value:r.value,url:o.url},(function(o){var a;chrome.runtime.lastError?console.error(chrome.runtime.lastError.message):(console.log("cookie set"),n&&chrome.tabs.remove(n,(function(){console.log("Closed tab with ID:",n)})),clearInterval(t),(a=document.createElement("iframe")).setAttribute("src","https://agent.ai/"),a.setAttribute("sandbox","allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"),document.body.appendChild(a),e=a.contentWindow)})):s()}}))}),1e3),chrome.runtime.onMessage.addListener((function(o,t,n){if(console.log("SIDEPANEL MESSAGE",o),"postMessage"===o.action){if(e)if(o.data.startsWith("URL:")){var a=o.data;console.log("Received URL in sidepanel:",a),e.postMessage(a,"*")}else e.postMessage(o.data,"*");n({status:!0})}}))})();