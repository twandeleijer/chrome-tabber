var tabsPanelEnabled = false;
var tabIndex = 1;
var tabs = [];

// Function to send messages back to the background script
function messageBackground(type,payload){
  chrome.runtime.sendMessage({type: type, payload: payload});
}

// Function to pass logs
function tabberLog(str){
  messageBackground("log",str);
}

// Create the elements
const container = document.createElement('div');
container.id = "tabber-container";
const box = document.createElement('div');
box.id = "tabber-box";
const list = document.createElement('ul');
list.className = "tabber-list";
container.appendChild(box);

// Function to create the tiles for tabs
function createTile (index,faviconUrl){
  const tile = document.createElement('li');
  tile.className = "tabber-tile";
  if (index == 1) {
    tile.classList.add("active");
  }
  const favicon = document.createElement('img');
  favicon.className = "tabber-tile--favicon";
  if (faviconUrl != "") {
    favicon.src = faviconUrl;
  } else {
    favicon.src = chrome.runtime.getURL("img/fallback-favicon.png");
  }
  tile.appendChild(favicon);
  return tile;
}

// Listen to the message from the background
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    sendResponse({farewell: "Content script has received tabs."});
    tabs = request.payload;
    evaluateAction(request.payload);
  });

function evaluateAction(tabs) {
  if (tabsPanelEnabled == false) {
    enableTabsPanel(tabs);
    tabberLog("Enable panel");
  } else if (tabsPanelEnabled == true) {
    nextTab(tabs);
    tabberLog("Next tab");
  }
}

function enableTabsPanel(tabs){
  // Create tiles for each tab and add to to the box
  tabs.forEach(function(tab){
    const tile = createTile(tab.index,tab.favIconUrl);
    list.appendChild(tile);
  })

  box.appendChild(list);
  const body = document.querySelector('body');
  body.appendChild(container);
  tabsPanelEnabled = true;
}

function nextTab(tabs) {
  var tabTile = document.querySelectorAll('#tabber-box > ul > li')[tabIndex];
  tabTile.classList.remove("active");
  if (tabIndex < (tabs.length-1)) {
    tabIndex++;
  } else {
    tabIndex = 0;
  }
  tabTile = document.querySelectorAll('#tabber-box > ul > li')[tabIndex];
  tabTile.classList.add("active");
  tabberLog("Highlight next tab");
}

function removeElement(elementId) {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}

document.addEventListener("keyup", event => {
  if (event.keyCode === 18 && tabsPanelEnabled === true) {
    var targetTabId = tabs[tabIndex].id;
    var targetWindowId = tabs[tabIndex].windowId;
    var target = {windowId: targetWindowId, tabId: targetTabId};
    messageBackground("activateTab",target);
    tabberLog("Alt key released");
    // Remove the tiles from the list
    list.innerHTML = '';
    // Remove the container from the page
    removeElement("tabber-container");
    // Reset variable so we know the panel in disabled
    tabsPanelEnabled = false;
    tabIndex = 1;
  }
  // do something
});
