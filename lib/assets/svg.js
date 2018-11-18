const path = require('path');
const fs = require('fs');
const util = require('util');

const svg2png = require('svg-to-png');

const exists = util.promisify(fs.exists);
const mkdir = util.promisify(fs.mkdir);
const copy = util.promisify(fs.copyFile);

module.exports = async function(config) {
    const convert = config.out.split('.').pop() === 'png';
    const outDir = path.dirname(config.out);

    console.log(`|> Rendering svg:`, config.link);

    if (!(await exists(outDir)))
        await mkdir(outDir, { recursive: true });

    if (convert)
        await svg2png.convert(config.file, outDir);
    else
        await copy(config.file, config.out);

    console.log('|> Rendered svg:', config.link);

    return true;
};
