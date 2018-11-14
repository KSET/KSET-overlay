const path = require('path');
const Asset = require('./Asset');

module.exports = class AssetWatcher {

    constructor(rootDir, assets = []) {
        this.rootDir = rootDir;
        this.assets = [];

        this.watch(assets);
    }

    watch(resourceList = []) {
        this.assets = resourceList.map(this.watcher());

        return this.assets;
    }

    watcher() {
        return (resource) => {
            if (!(resource instanceof Object))
                return;

            const defaults = {
                file: path.join(this.rootDir, resource.link || ''),
                algo: 'sha256',
                action: () => Promise.resolve(),
            };

            const newAsset = Object.assign({}, defaults, resource);

            return new Asset(newAsset);
        };
    }

    setAssets(assets) {
        return this.watch(assets);
    }

    addAssets(assets) {
        return this.assets.push(...assets.map(this.watcher()));
    }

    addAsset(asset) {
        return this.addAssets([ asset ]);
    }

    getAssets(...names) {
        return this.get(...names);
    }

    get(...names) {
        if (names.length === 1 && names[ 0 ] === '*')
            return this.assets;

        return (
            this.assets
                .filter((asset) => names.includes(asset.name))
                .map((asset) => asset.get())
        );
    }

};
