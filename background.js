// Listen for keyboard input
chrome.commands.onCommand.addListener(switchTabs);

function tabberLog(str) {
	console.log("Tabber: " + str);
}

function switchTabs(){
	tabberLog("Key command received");
	var currentTabs = getCurrentTabs();
	triggerSwitcher(currentTabs);
}

function getCurrentTabs() {
	var tabs = [];
	chrome.tabs.query({currentWindow: true}, function(queryResults) {
		queryResults.forEach(function(result){
			tabs.push(result);
		});
	});
	return tabs;
}

function triggerSwitcher(currentTabs){
	// Send message with tabs to the content script
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  	chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello", payload: currentTabs}, function(response) {
    tabberLog(response.farewell);
  	});
});
}

function activateTab(windowId,tabIdToMakeActive) {
	chrome.windows.update(windowId, {"focused":true});
	chrome.tabs.update(tabIdToMakeActive, {active:true, highlighted: true});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
		if (request.type == "log") {
			tabberLog(request.payload);
		} else if (request.type == "activateTab") {
			tabberLog(request.payload);
			activateTab(request.payload.windowId,request.payload.tabId);
		}
    sendResponse({farewell: "Background script has received message."});
  });
