async function drawImage(ctx, response) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => {
            const x = 220;
            const y = 196;
            ctx.drawImage(image, x, y, 640, 640);
            resolve();
        });
        image.addEventListener("error", reject);
        image.src = response.artistImage;
        image.crossOrigin = '';
    });
}

function drawTextColumns(ctx, response) {
    const paddingLeft = 96;
    const centerX = 540;
    const startY = 1033;
    const rowLineHeight = 56;

    function drawTruncatedText(text, x, y, maxWidth) {
        if (ctx.measureText(text).width <= maxWidth) {
            ctx.fillText(text, x, y);
        } else {
            while (ctx.measureText(text + '...').width > maxWidth) {
                text = text.slice(0, -1);
            }
            if (text.slice(-1) === ' ') {
                text = text.slice(0, -1);
            }

            ctx.fillText(text + '...', x, y);
        }
    }

    ctx.font = "500 36px 'Noto Sans'";
    ctx.fillStyle = window.getComputedStyle(document.getElementById('resultContainer')).getPropertyValue('color');
    ctx.fillText("Top Artists", paddingLeft, startY);
    ctx.fillText("Top Songs", centerX, startY);

    ctx.font = "700 44px 'Montserrat'";

    for (let i = 0; i < 5; i++) {
        drawTruncatedText(`${i + 1} ${response.artists[i].name}`, paddingLeft, startY + 16 + rowLineHeight * (i + 1), centerX - paddingLeft - 48);
    }

    for (let i = 0; i < 5; i++) {
        drawTruncatedText(`${i + 1} ${response.songs[i].name}`, centerX, startY + 16 + rowLineHeight * (i + 1), centerX - 48);
    }
}

function drawMinutes(ctx, response) {
    const startY = 1513;
    const paddingLeft = 96;

    ctx.font = "500 36px 'Noto Sans'";
    ctx.fillStyle = window.getComputedStyle(document.getElementById('resultContainer')).getPropertyValue('color');
    ctx.fillText("Minutes Listened", paddingLeft, startY);

    ctx.font = "700 108px 'Montserrat'";
    ctx.fillText(`${response.minutesListened.toLocaleString(undefined)}`, paddingLeft, startY + 124);
}

function drawSignature(ctx) {
    ctx.font = "700 48px 'Montserrat'";
    ctx.fillStyle = window.getComputedStyle(document.getElementById('resultContainer')).getPropertyValue('color');

    ctx.fillText("TIGHNARI.ME/WRAPPED", 406, 1848);
}

export async function drawCanvas(response) {
    response = JSON.parse(response);
    const canvasWidth = 1080;
    const canvasHeight = 1920;

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext("2d");

    context.fillStyle = window.getComputedStyle(document.getElementById('resultContainer')).getPropertyValue('background-color');
    context.beginPath();
    context.rect(0, 0, canvasWidth, canvasHeight);
    context.fill();

    await drawImage(context, response);
    drawTextColumns(context, response);
    drawMinutes(context, response);
    drawSignature(context);

    return canvas;
}