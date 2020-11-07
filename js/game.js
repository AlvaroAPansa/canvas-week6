//1. Drawing in Canvas
var canvas = null, ctx = null;
function paint(ctx) {
    ctx.fillStyle = '#0f0'; // The style of the fill comand below
    ctx.fillRect(50, 50, 100, 60);// Draws a filled rectangle (coord x, coord y, width, height)
    /*ctx.strokeStyle = '#00f';
    ctx.strokeRect(40, 40, 120, 80); // Draws an empty rectangle
    ctx.fillStyle = '#ff0';
    ctx.fillRect(0, 0, 20, 150);
    ctx.fillRect(40, 0, 20, 150);
    ctx.fillRect(80, 0, 20, 150);
    ctx.fillRect(120, 0, 20, 150);
    ctx.fillRect(160, 0, 20, 150);
    ctx.fillStyle = '#00f';
    ctx.fillRect(20, 0, 20, 150);
    ctx.fillRect(60, 0, 20, 150);
    ctx.fillRect(100, 0, 20, 150);
    ctx.fillRect(140, 0, 20, 150);
    ctx.fillRect(180, 0, 20, 150);*/
}
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    paint(ctx);
}
window.addEventListener('load', init, false);
//2. Animating the canvas