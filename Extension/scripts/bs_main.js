function init() {
    prepareNoPreview(), prepareNoFavIcon(), watchForTabSet(), initListeners(), debouncedUpdate(), onInstalled(), setInterval(function() {
        captureScreen()
    }
    ,
    window.tabSwitcherConfig.captureScreenTimeout)
}
function initListeners() {
    chrome.runtime.onMessage.addListener(function(a, b, c) {
        a.action===window.tabSwticherActions.captureScreen?captureScreen(a, b, c): a.action===window.tabSwticherActions.getTabsInfo?getTabsInfo(a, b, c): a.action===window.tabSwticherActions.switchTab?switchTab(a, b, c): a.action===window.tabSwticherActions.popupIsShown?popupShown(a, b, c): a.action===window.tabSwticherActions.popupIsHidden&&popupHidden(a, b, c)
    }
    )
}
function watchForTabSet() {
    chrome.tabs.onActivated.addListener(debouncedUpdate), chrome.tabs.onCreated.addListener(debouncedUpdate), chrome.tabs.onRemoved.addListener(debouncedUpdate), chrome.tabs.onReplaced.addListener(debouncedUpdate), chrome.tabs.onAttached.addListener(debouncedUpdate), chrome.tabs.onDetached.addListener(debouncedUpdate), chrome.tabs.onMoved.addListener(debouncedUpdate), chrome.tabs.onSelectionChanged.addListener(debouncedUpdate), chrome.tabs.onActiveChanged.addListener(debouncedUpdate)
}
function initCommandListener() {
    chrome.commands.onCommand.addListener(function(a) {
        console.log(a), "toggle-tabs-popup-left"===a?switchTabCommandTriggered(!1): "toggle-tabs-popup-right"===a&&switchTabCommandTriggered(!0)
    }
    )
}
function generateBlankTabInfo(a) {
    return {
        id: a, dirty: !0, active: !1, screenshotDataUri: null, screenGettingStarted: !1, title: "", favicon: null, faviconUrl: null
    }
}
function prepareNoPreview() {
    var a=chrome.extension.getURL("images/noTabPreview.jpg");
    convertImgToDataURLviaCanvas(a, function(a) {
        noPreviewDataUri=a
    }
    )
}
function prepareNoFavIcon() {
    var a=chrome.extension.getURL("images/nofavicon.png");
    convertImgToDataURLviaCanvas(a, function(a) {
        noFaviconDataUri=a
    }
    )
}
function onInstalled() {
    chrome.runtime.onInstalled.addListener(function(a) {
        "install"==a.reason?chrome.windows.getAll( {}, function(a) {
            for(var b in a)reloadWindow(a[b])
        }
        ):"update"==a.reason
    }
    )
}
function reloadWindow(a) {
    chrome.tabs.getAllInWindow(a.id, function(a) {
        for(var b in a) {
            var c=a[b];
            chrome.tabs.update(c.id, {
                url: c.url, selected: c.selected
            }
            ,
            null)
        }
    }
    )
}
function popupShown() {
    isSwitchInProgress=!0
}
function popupHidden() {
    isSwitchInProgress=!1
}
function captureScreen() {
    isSwitchInProgress||(console.log("handle capturing screen"), debouncedUpdate(), chrome.tabs.query( {
        active: !0, currentWindow: !0
    }
    ,
    function(a) {
        if(a&&a.length&&!isSwitchInProgress) {
            var b=a[0].id;
            tabsInfo[b]||(tabsInfo[b]=generateBlankTabInfo(b)), takingScreensIndicator[b]||(takingScreensIndicator[b]=!0, captureTab(function(a) {
                takingScreensIndicator[b]=!1, tabsInfo[b]=tabsInfo[b]||generateBlankTabInfo(b), tabsInfo[b].screenshotDataUri=a, console.log("tab captured", b)
            }
            ))
        }
    }
    ))
}
function getTabsInfo(a,
b,
c) {
    c( {
        tabs: tabsInfo, noPreview: noPreviewDataUri
    }
    )
}
function switchTabCommandTriggered(a) {
    var b= {
        action:window.tabSwticherActions.triggerSwitchTabCommand, data: {
            isNextTabDesired: a
        }
    }
    ;
    chrome.tabs.query( {
        active: !0, currentWindow: !0
    }
    ,
    function(a) {
        for(var c=0;
        c<a.length;
        ++c)chrome.tabs.sendMessage(a[c].id, b)
    }
    )
}
function switchTab(a,
b,
c) {
    var d=a.data.tabId;
    chrome.tabs.update(d, {
        active: !0
    }
    )
}
function updateTabsInfo() {
    isUpdateInProgress||(isUpdateInProgress=!0, Object.keys(tabsInfo).forEach(function(a) {
        tabsInfo[a].dirty=!1
    }
    ),
    chrome.tabs.query( {
        currentWindow: !0
    }
    ,
    function(a) {
        addNewlyCreatedTabs(a), markAvailableTabs(a), removeNotAvailableTabs(a), loadFavicons(a), sortTabsWithVisibleOrder(a), setActiveTab(a), setTabsTitles(a), isUpdateInProgress=!1
    }
    ))
}
function markAvailableTabs(a) {
    _.each(a, function(a) {
        var b=a.id;
        tabsInfo[b].dirty=!0
    }
    )
}
function removeNotAvailableTabs(a) {
    Object.keys(tabsInfo).forEach(function(a) {
        tabsInfo[a].dirty||delete tabsInfo[a]
    }
    )
}
function sortTabsWithVisibleOrder(a) {
    for(var b=0;
    b<a.length;
    b++)tabsInfo[a[b].id].order=b
}
function addNewlyCreatedTabs(a) {
    _.each(a, function(a) {
        var b=a.id;
        tabsInfo[b]||(tabsInfo[b]=generateBlankTabInfo(b))
    }
    )
}
function setActiveTab(a) {
    chrome.tabs.query( {
        active: !0, currentWindow: !0
    }
    ,
    function(a) {
        if(a&&a.length) {
            Object.keys(tabsInfo).forEach(function(a) {
                tabsInfo[a].active=!1
            }
            );
            var b=a[0].id;
            tabsInfo[b].active=!0
        }
    }
    )
}
function setTabsTitles(a) {
    _.each(a, function(a) {
        var b=a.id;
        tabsInfo[b].title=a.title
    }
    )
}
function loadFavicons(a) {
    _.each(a, function(a) {
        var c, b=tabsInfo[a.id];
        return a.favIconUrl?(c=a.favIconUrl, void(b.favicon&&b.faviconUrl===c||convertImgToDataURLviaCanvas(c, function(a) {
            b.favicon=a, b.faviconUrl=c
        }
        ))):(b.favicon=noFaviconDataUri,
        void(b.faviconUrl=chrome.extension.getURL("images/nofavicon.png")))
    }
    )
}
var tabsInfo= {},
takingScreensIndicator= {},
noPreviewDataUri=null,
noFaviconDataUri=null,
isUpdateInProgress=!1,
isSwitchInProgress=!1,
debouncedUpdate=_.debounce(updateTabsInfo,
100,
{
    trailing: !0
}
);
init();