const fs = require('fs');
const util = require('util');
const crypto = require('crypto');

const readFile = (...args) => util.promisify(fs.readFile)(...args);

module.exports = class Asset {

    constructor(resource) {
        if (!(resource instanceof Object))
            return;

        this.resource = resource;

        this.updateTag();

        if (this.isFile)
            this.watch();
    }

    get() {
        return this.resource;
    }

    get name() {
        return this.resource.name;
    }

    get href() {
        const resource = this.get();

        if (typeof resource.href === typeof true)
            return resource.link;

        return resource.href;
    }

    get file() {
        return this.resource.file;
    }

    get out() {
        return this.resource.out || this.file;
    }

    get resourceData() {
        const { resource } = this;

        if (resource.href)
            return Promise.resolve(this.href);

        if (resource.file)
            return readFile(this.file, 'utf8');

        return null;
    }

    get isFile() {
        return Boolean(this.resource.file);
    }

    get action() {
        return (this.resource.action || (() => Promise.resolve(true))).bind(null, this.get());
    }

    watch() {
        const source = async () => this.action();
        const resource = async () => this.updateTag();

        fs.watchFile(this.file, source);
        fs.watchFile(this.out, resource);
    }

    async updateTag() {
        const resource = this.resource;

        resource[ 'tag' ] = this.constructor.generateTag(await this.resourceData);

        return resource;
    }

    static generateTag(cypherText) {
        return (
            crypto.createHash('md5')
                  .update(cypherText)
                  .digest('hex')
        );
    }

};
