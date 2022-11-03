const Item = require("./DataStructure/Item");
const Monster = require("./DataStructure/Monster");

const Validator = class {
    constructor() {
        this.ItemValidation = Item;
        this.MonsterValidation = Monster;
    }

    strictBuild(data,type) {
        if(type === "item"){
            return this.ItemValidation.buildStrict(data);
        }
        if (type === "monster") {
            return this.MonsterValidation.buildStrict(data);
        }

    }
}



module.exports = {
    Validator
}