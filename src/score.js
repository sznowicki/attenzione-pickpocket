// License: https://github.com/lonekorean/diff-cam-engine/blob/master/diff-cam-engine.js

const pixelDiffThreshold = 32;
export const getScore = (imageData) => {
    const rgba = imageData.data;

    let score = 0;
    for (var i = 0; i < rgba.length; i += 4) {
        var pixelDiff = rgba[i] * 0.3 + rgba[i + 1] * 0.6 + rgba[i + 2] * 0.1;
        var normalized = Math.min(255, pixelDiff * (255 / pixelDiffThreshold));
        rgba[i] = 0;
        rgba[i + 1] = normalized;
        rgba[i + 2] = 0;

        if (pixelDiff >= pixelDiffThreshold) {
            score++;
        }
    }

    return score;
}