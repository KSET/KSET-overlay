const path = require('path');
const ClosureCompilerPlugin = require('webpack-closure-compiler');
const webpack = require('webpack');

module.exports = async function(config) {
    const opts = {
        entry: {
            file: [
                config.file,
            ],
        },
        output: {
            filename: path.basename(config.out),
            path: path.dirname(config.out),
        },
        plugins: [
            new ClosureCompilerPlugin(
                {
                    compiler: {
                        language_in: 'ECMASCRIPT_NEXT',
                        language_out: 'ECMASCRIPT3',
                        compilation_level: 'SIMPLE',
                        rewrite_polyfills: true,
                    },
                    concurrency: 3,
                },
            ),
        ],
    };

    console.log('|> Rendering js:', config.link);
    webpack(opts, (err, stats) => {
        if (err || stats.hasErrors())
            console.log(err, stats);

        console.log('|> Rendered js:', config.link);
    });
};
