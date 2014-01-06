/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * stopflash.js
 */

// class StopFlashUI extends Builder
function StopFlashUI(elements)
{
    this.super('div');

    this.content = new Builder('div')
        .className('content');

    this.append(new Builder('div')
            .className('head')
            .text('StopFlash'))
        .append(new Builder('div')
            .className('menu')
            .append(new Builder('a')
                .text('Home'))
            .append(new Builder('a')
                .text('Whitelist'))
            .append(new Builder('a')
                .text('Options')))
        .append(this.content)
        .append(new Builder('div')
            .className('foot')
            .html('<a href="https://github.com/JWhile/StopFlash">https://github.com/JWhile/StopFlash</a>'))
}
fus.extend(StopFlashUI, Builder);

// main
var main = function(elements)
{
    new StopFlashUI(elements)
        .insert(document.body);
};

chrome.tabs.query({'highlighted': true, 'currentWindow': true}, function(tabs)
{
    chrome.tabs.sendMessage(tabs[0].id, {'getElements': 'stopflash'}, main);
});
