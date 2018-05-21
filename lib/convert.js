const debug = require('debug');

const dissectShim = require('./dissect-shim');

const info = debug('r2w:info:convert');
const verbose = debug('r2w:verbose:convert');

function literalize(literal) {
    return '%LITERAL%' + literal + '%LITERAL%';
}

function moduleReducer(result, module) {
    result[module.name] = './' + module.name;

    return result;
}

module.exports = function convert(config) {
    info('Starting conversion.');

    const baseUrl = literalize(
        "path.join(__dirname, '" + config.baseUrl + "')"
    );

    config.paths = Object.entries(config.paths).reduce((acc, val) => {
        acc[val[0]] = literalize(
            "path.resolve(__dirname, '" +
                'public/javascripts/' +
                "', '" +
                val[1] +
                "')"
        );
        return acc;
    }, {});

    const dissectedShims = dissectShim(config.shim);

    const webpackConfig = {
        context: baseUrl,
        mode: 'development',
        resolve: {
            modules: [baseUrl, 'node_modules'],
            alias: config.paths
        },
        entry: config.modules.reduce(moduleReducer, {}),
        output: {
            path: literalize("path.join(__dirname, '" + config.dir + "')"),
            filename: '[name].js'
        }
    };

    verbose('Webpack config:', webpackConfig);
    verbose('Webpack dissected shims:', dissectedShims);

    return {
        config: webpackConfig,
        shims: dissectedShims
    };
};
