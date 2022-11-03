let RPGModule = require("./src/RPGModule.js");
RPGModule.register.registerItems({
    "caca":{
        "name": "caca",
        "isMaterial": true,
        "weaponsStat": {},
        "armorStats": {},
        "store": {
            "sell": 1,
            "buy": 1
        },
        description: "caca"
    }
})
RPGModule.register.registerMonsters({
    "test": {
        name: "test",
        test:"testf",
        stats: {
            pv: 10,
            attack: 10,
            defence: 10,
            speed: 10,
            critial: 10
        },
        loot: [{
            name: "Os",
            probability: 100,
            maxLoot: 10
        },
            {
                name: "caca",
                probability: 100,
                maxLoot: 10
            }],
        description: "test"
    },
    "test2": {
        name: "test",
        test:"testf",
        stats: {
            pv: 10,
            attack: 10,
            defence: 10,
            speed: 10,
            critial: 10
        },
        loot: [],
        description: "test"
    }

})