function init() {
    initListeners(), listenForKeyboard(), listenForMouse()
}
function initListeners() {
    chrome.runtime.onMessage.addListener(function(a, b, c) {
        a.action===window.tabSwticherActions.triggerSwitchTabCommand&&switchTabCommandTriggered(a, b, c)
    }
    )
}
function setupTabCapturing() {
    $(window).mouseleave(function() {
        console.log("mouseleave"), captureCurrentTab()
    }
    ),
    $(function() {
        console.log("ready"), captureCurrentTab()
    }
    ),
    setInterval(function() {
        captureCurrentTab()
    }
    ,
    window.tabSwticherActions.captureScreenTimeout)
}
function listenForKeyboard() {
    var a=new window.keypress.Listener;
    a.register_combo( {
        keys: window.tabSwitcherConfig.combo.nextTab, on_keydown: function() {
            switchTabCommandTriggered(!0)
        }
        ,
        on_release:keysReleased,
        prevent_default:!1,
        is_counting:!0,
        is_exclusive:!0
    }
    ),
    a.register_combo( {
        keys: window.tabSwitcherConfig.combo.previousTab, on_keydown: function() {
            switchTabCommandTriggered(!1)
        }
        ,
        on_release:keysReleased,
        prevent_default:!1,
        is_counting:!0,
        is_exclusive:!0
    }
    ),
    a.register_combo( {
        keys: window.tabSwitcherConfig.combo.arrowLeft, on_keydown: function() {
            activateTabByArrow( {
                left: !0
            }
            )
        }
        ,
        prevent_default:!1,
        is_counting:!0,
        is_exclusive:!0
    }
    ),
    a.register_combo( {
        keys: window.tabSwitcherConfig.combo.arrowRight, on_keydown: function() {
            activateTabByArrow( {
                right: !0
            }
            )
        }
        ,
        prevent_default:!1,
        is_counting:!0,
        is_exclusive:!0
    }
    ),
    a.register_combo( {
        keys: window.tabSwitcherConfig.combo.arrowUp, on_keydown: function() {
            activateTabByArrow( {
                up: !0
            }
            )
        }
        ,
        prevent_default:!1,
        is_counting:!0,
        is_exclusive:!0
    }
    ),
    a.register_combo( {
        keys: window.tabSwitcherConfig.combo.arrowDown, on_keydown: function() {
            activateTabByArrow( {
                down: !0
            }
            )
        }
        ,
        prevent_default:!1,
        is_counting:!0,
        is_exclusive:!0
    }
    )
}
function listenForMouse() {
    $(document).on("mouseenter", "#tab-switcher-popup .tab-preview", function() {
        var a=$(this), b=a.data("tab-id");
        activateTabById(b)
    }
    ),
    $(document).on("click",
    "#tab-switcher-popup .tab-preview",
    function() {
        var a=$(this);
        a.data("tab-id");
        keysReleased()
    }
    )
}
function captureCurrentTab() {
    var a= {
        action: window.tabSwticherActions.captureScreen
    }
    ;
    chrome.runtime.sendMessage(a)
}
function switchTabCommandTriggered(a) {
    isPopupShown?changeDesiredTab(a): appearPanel()
}
function activateTabById(a) {
    activeTabIndex=_.findIndex(tabPreviews, {
        id: a
    }
    ),
    applyNewActiveClass()
}
function activateTabByArrow(a) {
    var b=[], c=getPreviewSize(tabPreviews.length), d=c.rows, e=c.columns;
    if(!(d<2&&(a.up||a.down))) {
        for(var f=0;
        f<d;
        f++)b.push([]);
        for(var g=0;
        g<d;
        g++)for(var h=0;
        h<e;
        h++) {
            var i=g*e+h;
            i<tabPreviews.length&&b[g].push(tabPreviews[i])
        }
        var j=Math.floor(activeTabIndex/window.tabSwitcherConfig.maxPreviewsInLine),
        k=activeTabIndex%window.tabSwitcherConfig.maxPreviewsInLine;
        a.up?(j--,
        j<0&&(j=d-1),
        b[j]&&b[j][k]||j--):a.down?(j++,
        j>=d&&(j=0),
        b[j]&&b[j][k]||(j=0)):a.left?(k--,
        k<0&&(k=b[j].length-1)):a.right&&(k++,
        k>=b[j].length&&(k=0));
        try {
            var l=b[j][k].id
        }
        catch(a) {
            console.log("error ", j, k)
        }
        activateTabById(l)
    }
}
function changeDesiredTab(a) {
    a?activeTabIndex++: activeTabIndex--, activeTabIndex<0?activeTabIndex=tabPreviews.length-1: activeTabIndex>=tabPreviews.length&&(activeTabIndex=0), applyNewActiveClass()
}
function applyNewActiveClass() {
    $(".tab-switcher-container .tab-card").removeClass("tab-card-active"), $(".tab-switcher-container .tab-card:eq( "+activeTabIndex+" )").addClass("tab-card-active")
}
function appearPanel() {
    showEmptyPanel(), isPopupShown=!0;
    var a= {
        action: window.tabSwticherActions.popupIsShown
    }
    ;
    chrome.runtime.sendMessage(a);
    var b= {
        action: window.tabSwticherActions.getTabsInfo
    }
    ;
    chrome.runtime.sendMessage(b,
    function(a) {
        return tabPreviews=[], Object.keys(a.tabs).forEach(function(b) {
            tabPreviews.push(a.tabs[b])
        }
        ),
        tabPreviews.length<window.tabSwitcherConfig.minOpenedTabsForEnableExtension?void(isPopupShown=!1):(tabPreviews=_.sortBy(tabPreviews,
        "order"),
        activeTabIndex=_.findIndex(tabPreviews,
        {
            active: !0
        }
        ),
        initialActiveTabIndex=activeTabIndex,
        void renderTabsInfo(a.noPreview))
    }
    )
}
function showEmptyPanel() {}function renderTabsInfo(a) {
    console.log("renderTabsInfo"), console.log(tabPreviews);
    var b=getPreviewSize(tabPreviews.length), c=.1*b.previewTileSize, d=b.previewTileSize*b.columns+2*c+20, e=b.previewTileSize*b.rows+2*c, f=b.previewTileSize-30;
    f=f>0?f: 0;
    var g=.25*f, h=.3*-g, i=.3*-g, j="<div id='tab-switcher-popup-overlay'></div>", k=_.template(j)( {});
    $(k).appendTo("body");
    var l="<div id='tab-switcher-popup' class='tab-switcher-container' style='width:<%-popupWidth%>px; border-width:<%-border%>px;'><% tabs.forEach(function(tab) { %><div class='tab-card <%-(tab.active ? 'tab-card-active' : '')%>' style='width:<%-tileSize%>px;'><div class='tab-preview-wrapper' style='width:<%-tileSize%>px; height:<%-tileSize%>px;' ><div class='tab-preview' data-tab-id='<%-tab.id%>' style='width:<%-previewSize%>px; height:<%-previewSize%>px; background-image: url(<%= tab.screenshotDataUri || noPreview %>); background-repeat: no-repeat; background-size: cover; background-position: left top '><img class='tab-favicon' src='<%= tab.favicon %>' style='bottom: <%-faviconBottom%>px; right: <%-faviconRight%>px; width: <%-faviconSize%>px; height: <%-faviconSize%>px' /></div></div><div class='tab-title'><%-tab.title%></div></div><% }); %></div>", m=_.template(l)( {
        tabs: tabPreviews, noPreview: a, popupWidth: d, popupHeight: e, tileSize: b.previewTileSize, previewSize: f, border: c, faviconSize: g, faviconBottom: h, faviconRight: i
    }
    );
    $(m).appendTo("body")
}
function getPreviewSize(a) {
    var b=$(window).width(), d=($(window).height(), Math.ceil(a/window.tabSwitcherConfig.maxPreviewsInLine)), e=Math.min(window.tabSwitcherConfig.maxPreviewsInLine, a), f=window.tabSwitcherConfig.minPreviewSizePx+30, g=.8*b/e;
    Math.max(f, g), .8*b/window.tabSwitcherConfig.maxPreviewsInLine;
    return {
        previewTileSize: 120, rows: d, columns: e
    }
}
function keysReleased() {
    if(isPopupShown) {
        isPopupShown=!1, $("#tab-switcher-popup").remove(), $("#tab-switcher-popup-overlay").remove();
        var a= {
            action: window.tabSwticherActions.popupIsHidden
        }
        ;
        if(chrome.runtime.sendMessage(a),
        activeTabIndex!==initialActiveTabIndex) {
            var b=tabPreviews[activeTabIndex];
            initialActiveTabIndex=activeTabIndex, switchTab(b)
        }
    }
}
function switchTab(a) {
    var b= {
        action:window.tabSwticherActions.switchTab, data: {
            tabId: a.id
        }
    }
    ;
    chrome.runtime.sendMessage(b)
}
console.log("ta-dam!");
var isPopupShown=!1,
tabPreviews=[],
initialActiveTabIndex=null,
activeTabIndex=null;
init();