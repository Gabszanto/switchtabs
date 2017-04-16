function captureTab(a) {
    chrome.tabs.captureVisibleTab(null, {
        format: "jpeg", quality: 30
    }
    ,
    function(b) {
        a(b)
    }
    )
}
chrome.runtime.onMessage.addListener(function(a,
b,
c) {
    "tabSwitcherCaptureScreen"===a.message&&captureTab(function(a) {
        chrome.tabs.query( {
            active: !0, currentWindow: !0
        }
        ,
        function(b) {
            chrome.tabs.sendMessage(b[0].id, {
                message: "tabSwitcherCaptureScreenResponse", dataURI: a
            }
            )
        }
        )
    }
    )
}
);