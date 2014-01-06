/**
 * StopFlash
 *
 * https://github.com/JWhile/StopFlash
 *
 * stopflash.js
 */

// class StopFlashUI extends Builder
function StopFlashUI()
{
    this.super('div');
}
fus.extend(StopFlashUI, Builder);

// main
new StopFlashUI()
    .insert(document.body);
