const {attributes} = require("structure");

class InvalidItemError extends Error {
    constructor(errors) {
        super('This Structure is not Valid');
        this.code = 'INVALID_MONSTER';
        this.errors = errors;
    }
}
let stats = attributes({
    pv: {
        type: Number,
        required: true
    },
    attack: {
        type: Number,
        required: true
    },
    defence: {
        type: Number,
        required: true
    },
    speed: {
        type: Number,
        required: true
    },
    critial: {
        type: Number,
        required: true
    }

},{
    strictValidationErrorClass: InvalidItemError
})(class Stats {});

let level= attributes({
    low:stats,
    //medium:stats,
    //high:stats,
    //epic:stats,
    //legendary:stats,
    //:stats,
},{ strictValidationErrorClass: InvalidItemError})(class Level {});

let loot = attributes({
    name:{
        type:String,
        required:true
    },
    probability:{
        type:Number,
        required:true
    },
    maxLoot:{
        type:Number,
        required:true
    }
},{ strictValidationErrorClass: InvalidItemError})(class Loot {});

let Monster = attributes({
    name: {
        type: String,
        required: true
    },
    level:level,
    loot:{
      type:Array, itemType:loot
    },
    description: {
        type: String,
        required: true
    }
},{ strictValidationErrorClass: InvalidItemError })(class Monster {});

module.exports = Monster
