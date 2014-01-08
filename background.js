/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * background.js
 */

function BackgroundFlashData(id)
{
    this.id = id; // :int
    this.changed = false; // :boolean

    this.data = null; // :Object
}
// function setData(Object data):void
BackgroundFlashData.prototype.setData = function(data)
{
    this.data = data;

    this.changed = true;
};

var flashElements = {}; // :Map<chrome.Tab, Object>

chrome.runtime.onConnect.addListener(function(port)
{
    if(port.name === 'stopflashContentScript')
    {
        port.onMessage.addListener(function(rep)
        {
            if(rep['stopflashInit'])
            {
            }

            if(rep['stopflashDataUpdate'] && rep['stopflashData'])
            {
                flashElements[port.sender.tab] = rep.stopflashData;

                port.postMessage({succes: true});
            }
        });
    }
    else if(port.name === 'stopflashPopup')
    {
        port.onMessage.addListener(function(rep)
        {
            if(rep['stopflashInit'])
            {
                port.postMessage({'stopflashDataSend': true, 'stopflashData': flashElements[port.sender.tab]});
            }

            if(rep['stopflashStillHere'])
            {
            }
        });
    }
});
