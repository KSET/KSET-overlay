const fs = require('fs');
const postCSS = require('postcss');
const sass = require('node-sass');

module.exports = async function(config) {
    const sassOpts = {
        file: config.file,
        outFile: config.out,
        sourceMap: false,
        outputStyle: 'compressed',
    };

    console.log('|> Rendering scss:', config.link);
    sass.render(sassOpts, (err, { css }) => {
        if (err)
            return console.error('|> SCSS COMPILATION ERROR: ', err);

        const plugins = [
//            require('postcss-font-magician')({ display: 'swap' }),
            require('pixrem')(),
            require('autoprefixer')({ browsers: '> 0.01%' }),
            require('cssnano')(),
        ];

        postCSS(plugins)
            .process(css, { from: undefined })
            .then(({ css }) => fs.writeFile(sassOpts.outFile, css, () => true))
            .then(() => console.log('|> Rendered scss: ', config.link));
    });
};
