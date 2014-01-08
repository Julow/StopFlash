/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * background.js
 */

var flashElements = {}; // :Map<chrome.Tab, Object>

chrome.runtime.onConnect.addListener(function(port)
{
    if(port.sender.tab != null)
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
    else
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
