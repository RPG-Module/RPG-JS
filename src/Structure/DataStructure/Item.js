const {attributes} = require("structure");

class InvalidItemError extends Error {
    constructor(errors) {
        super('This Structure is not Valid');
        this.code = 'INVALID_ITEM';
        this.errors = errors;
    }
}
let WeaponsStats = attributes({
    attack: {
        type: Number,
    },
    defence: {
        type: Number,
    },
    durability: {
        type: Number,
    }
},{
    strictValidationErrorClass: InvalidItemError
})(class WeaponsStats {});
let ArmorStats = attributes({
    defence: {
        type: Number,
    },
    durability: {
        type: Number,
    },
},{
    strictValidationErrorClass: InvalidItemError
})(class ArmorStats {});
let StoreStats = attributes({
    sell: {
        type: Number,
        required: true
    },
    buy: {
        type: Number,
        required: true
    }
},{
    strictValidationErrorClass: InvalidItemError
})(class StoreStats {});

let Item = attributes({
    name: {
        type: String,
        required: true
    },
    isMaterial: {
        type: Boolean,
        required: true
    },
    weaponsStat: WeaponsStats,
    armorStats: ArmorStats,
    store: StoreStats,
    description: {
        type: String,
        required: true
    }
},{
    strictValidationErrorClass: InvalidItemError
})(class Item {});


module.exports = Item;