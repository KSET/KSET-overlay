const path = require('path');
const fs = require('fs');

const svg2png = require('svg-to-png');

module.exports = async function(config) {
    console.log('|> Rendering SVG:', config.link);

    const outDir = path.dirname(config.out);

    svg2png.convert(config.file, outDir)
           .then(() => console.log('|> Rendered SVG:', config.link));
};
