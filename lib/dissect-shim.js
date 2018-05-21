function removeDuplicates(element, position, array) {
    return array.indexOf(element) === position;
}

module.exports = function dissectShims(shims) {
    const dissected = {
        providedPlugins: [],
        rules: []
    };

    const keys = Object.keys(shims);
    const length = keys.length;

    for (let i = 0; i < length; i++) {
        let module = keys[i];
        let shim = shims[module];

        if (Array.isArray(shim)) {
            dissected.providedPlugins = dissected.providedPlugins.concat(
                `path.resolve(${shim})`
            );
            continue;
        }

        var exports = shim.exports;
        var imports = shim.deps;

        dissected.rules.push({
            test: '%LITERAL%/' + module + '/%LITERAL%',
            loader:
                'exports-loader?' +
                exports +
                (Array.isArray(imports)
                    ? '!imports-loader?' + imports.join(',')
                    : '')
        });
    }

    dissected.providedPlugins = dissected.providedPlugins.filter(
        removeDuplicates
    );

    return dissected;
};
