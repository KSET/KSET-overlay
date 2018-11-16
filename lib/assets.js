const path = require('path');
const AssetWatcher = require('./AssetWatcher');

const compileSCSS = require('./assets/scss');
const compileJS = require('./assets/js');

const $styles = [
    {
        name: 'overlay',
        file: path.resolve(__dirname, '../static/css/overlay.scss'),
        out: path.resolve(__dirname, '../public/css/overlay.css'),
        link: `/css/overlay.css`,
        action: compileSCSS,
    },
];

const $scripts = [
    {
        name: 'overlay',
        file: path.resolve(__dirname, '../static/js/Overlay.js'),
        out: path.resolve(__dirname, '../public/js/overlay.js'),
        link: `/js/overlay.js`,
        action: compileJS,
    },
];

const basePath = path.join(__dirname, '../public');

const styles = new AssetWatcher(basePath, $styles).runActions();
const scripts = new AssetWatcher(basePath, $scripts).runActions();

module.exports = { styles, scripts };
