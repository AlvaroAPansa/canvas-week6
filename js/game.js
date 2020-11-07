var canvas = null, ctx = null, x = 50, y = 50;
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    function (callback) {
        window.setTimeout(callback, 17);
    };
}());
function paint(ctx) {
    //ctx.fillStyle = '#0f0'; // The style of the fill comand below
    //ctx.fillRect(50, 50, 100, 60);// Draws a filled rectangle (coord x, coord y, width, height)
    //ctx.strokeStyle = '#00f';
    //ctx.strokeRect(40, 40, 120, 80); // Draws an empty rectangle
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(x, y, 10, 10);
}
function act(){
    x += 2;
    if (x > canvas.width) {
        x = 0;
    }
}
function run() {
    window.requestAnimationFrame(run);
    act();
    paint(ctx);
}
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    run();
}
window.addEventListener('load', init, false);