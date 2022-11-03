const {Validator} = require('../Structure/Validator');
const fs = require("fs");

module.exports = class RPGRegister {
    constructor() {
        this.items = new Map();
        this.monsters = new Map();
        this.validator = new Validator();
    }

    /**
     * Register a new item
     * @param {Object} data JSON or object data
     */
    registerItems(data) {
        const itemList = Object.keys(data);
        for (let i = 0; i < itemList.length; i++) {
            let item = this.validator.strictBuild(data[itemList[i]], "item");
            if (item.validate().valid) {
                console.info("[Item Register] Nouveau item enregistrer: " + itemList[i]);
            }
            this.items[itemList[i]] = item;
        }
        this._SaveItem();
    }

    /**
     * Register a new monster
     * @param {Object} data JSON or object data
     */

    registerMonsters(data) {
        //check if item this.items is empty
        if (Object.keys(this.items).length === 0) {
            throw new Error("[Monster Register] Pas d'item enregistrer");
        }
        const monsterList = Object.keys(data);
        for (let i = 0; i < monsterList.length; i++) {
            let entryMonster = data[monsterList[i]]
            let loot = entryMonster.loot;
            //check if loot is empty
            if (loot.length === 0) {
                console.warn("[Monster Register] Pas de loot tables pour " + monsterList[i]);
            } else {
                for (let j = 0; j < loot.length; j++) {
                    if (this.items[loot[j].name] === undefined) {
                        console.warn("[Monster Register] L'item " + loot[j].name + " n'éxiste pas");
                        //remove item from loot
                        loot.splice(j, 1);
                    }
                }
            }
            let monster = this.validator.strictBuild(entryMonster, "monster");
            if (monster.validate().valid) {
                console.info("[Monster Register] Nouveau monstre enregistrer: " + monsterList[i]);
                this.monsters[monsterList[i]] = monster;
            }
        }
        this._SaveMonster();
    }

    _SaveMonster() {
        const path = './src/Data/monster.json'
        //check if folder data exist
        if (!fs.existsSync('./src/Data/')) {
            fs.mkdirSync('./src/Data/');
        }
        try {
            fs.writeFileSync(path, JSON.stringify(this.monsters, null, 2));
        } catch (err) {
            console.error(err)
        }
    }

    _SaveItem() {
        const path = './src/Data/monster.json'
        //check if folder data exist
        if (!fs.existsSync('./src/Data/')) {
            fs.mkdirSync('./src/Data/');
        }
        try {
            fs.writeFileSync(path, JSON.stringify(this.items, null, 2));
        } catch (err) {
            console.error(err)
        }
    }
}