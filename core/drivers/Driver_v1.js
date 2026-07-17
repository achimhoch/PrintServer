class Driver {

    constructor(options = {}) {

        this.options = options;

    }

    async connect() {

        throw new Error("Not implemented");

    }

    async disconnect() {

        throw new Error("Not implemented");

    }

    async update() {

        throw new Error("Not implemented");

    }

    async print() {

        throw new Error("Not implemented");

    }

}

module.exports = Driver;