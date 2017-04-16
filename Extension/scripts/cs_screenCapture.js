function sendCaptureRequest(a,
b) {
    var c= {
        message: "bugnerdCaptureScreen"
    }
    ;
    chrome.runtime.sendMessage(c)
}
function drawImageScaled(a,
b) {
    var c=b.canvas, d=c.width/a.width, e=c.height/a.height, f=Math.min(d, e), g=a.width*f, h=a.height*f;
    c.width=g, c.height=h, b.clearRect(0, 0, c.width, c.height), b.drawImage(a, 0, 0, a.width, a.height, 0, 0, g, h)
}
function drawImageScaledWithShift(a,
b) {
    var c=b.canvas, d=c.width/a.width, e=c.height/a.height, f=Math.min(d, e), g=(c.width-a.width*f)/2, h=(c.height-a.height*f)/2;
    b.clearRect(0, 0, c.width, c.height), b.drawImage(a, 0, 0, a.width, a.height, g, h, a.width*f, a.height*f)
}
var showPreviewCallback=null,
showPreviewCanvas=null;
chrome.runtime.onMessage.addListener(function(a,
b,
c) {
    if("bugnerdCaptureScreenResponse"===a.message) {
        var d=showPreviewCanvas.getContext("2d"), e=new Image;
        e.onload=function() {
            drawImageScaled(e, d), showPreviewCallback&&showPreviewCallback(a.dataURI)
        }
        ,
        e.src=a.dataURI
    }
}
),
window.bugnerd_captureScreen=function(a,
b) {
    showPreviewCallback=b, showPreviewCanvas=a, sendCaptureRequest(a, b)
}
;