const path = require('path');
const AssetWatcher = require('./AssetWatcher');
const settings = require('./settings');

const compileSCSS = require('./assets/scss');
const compileJS = require('./assets/js');
const compileSVG = require('./assets/svg');

const baseUrl = settings.baseUrl;

function simpleStaticFile(name, startFile, endFile = null) {
    endFile = endFile || startFile;

    if (startFile.substr(0, 1) === '.')
        startFile = `${name}${startFile}`;

    if (endFile && endFile.substr(0, 1) === '.')
        endFile = `${name}${endFile}`;

    const startType = startFile.split('.').pop();
    const endType = endFile.split('.').pop();

    const opts = {
        name,
        file: path.resolve(__dirname, `../static/${startType}/${startFile}`),
        out: path.resolve(__dirname, `../public/${endType}/${endFile}`),
        link: `${baseUrl}/${endType}/${endFile}`,
    };

    if (startType === 'js')
        opts.action = compileJS;

    if (startType === 'scss')
        opts.action = compileSCSS;

    if (startType === 'svg')
        opts.action = compileSVG;

    return opts;
}

const $styles = [
    simpleStaticFile('overlay', '.scss', '.css'),
    simpleStaticFile('index', '.scss', '.css'),
    simpleStaticFile('login', '.scss', '.css'),
];

const $scripts = [
    simpleStaticFile('overlay', 'Overlay.js', 'overlay.js'),
    simpleStaticFile('index', '.js'),
    simpleStaticFile('login', '.js'),
];

const $images = [
    {
        name: 'logo',
        file: path.resolve(__dirname, `../static/img/logo.svg`),
        out: path.resolve(__dirname, `../public/img/logo.svg`),
        link: `${baseUrl}/img/logo.svg`,
        action: compileSVG,
    },
];

const basePath = path.join(__dirname, '../public');

const styles = new AssetWatcher(basePath, $styles).runActions();
const scripts = new AssetWatcher(basePath, $scripts).runActions();
const images = new AssetWatcher(basePath, $images).runActions();

module.exports = { styles, scripts, images };
