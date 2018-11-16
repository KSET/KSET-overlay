const path = require('path');
const AssetWatcher = require('./AssetWatcher');
const settings = require('./settings');

const compileSCSS = require('./assets/scss');
const compileJS = require('./assets/js');

const baseUrl = settings.baseUrl;

const $styles = [
    {
        name: 'overlay',
        file: path.resolve(__dirname, '../static/css/overlay.scss'),
        out: path.resolve(__dirname, '../public/css/overlay.css'),
        link: `${baseUrl}/css/overlay.css`,
        action: compileSCSS,
    },
];

const $scripts = [
    {
        name: 'overlay',
        file: path.resolve(__dirname, '../static/js/Overlay.js'),
        out: path.resolve(__dirname, '../public/js/overlay.js'),
        link: `${baseUrl}/js/overlay.js`,
        action: compileJS,
    },
];

const basePath = path.join(__dirname, '../public');

const styles = new AssetWatcher(basePath, $styles).runActions();
const scripts = new AssetWatcher(basePath, $scripts).runActions();

module.exports = { styles, scripts };
