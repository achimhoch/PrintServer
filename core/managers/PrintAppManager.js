"use strict";
class PrintAppManager {
    constructor(service) { 
        this.service = service; 
    }

    create(values) { 
        return this.service.create(values); 
    }

    list() { 
        return this.service.list(); 
    }

    get(id) { 
        return this.service.get(id); 
    }

    updateAssignment(id, values) { 
        return this.service.updateAssignment(id, values); 
    }

    revoke(id) { 
        return this.service.revoke(id); 
    }

    enable(id) {
         return this.service.enable(id); 
    }
}
module.exports = PrintAppManager;