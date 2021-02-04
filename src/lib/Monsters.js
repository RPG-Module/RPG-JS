const fs = require('fs/promises')
const Battles = require('../lib/Battles')
const Users = require('../lib/Users')
const Items = require('../lib/Items')
module.exports = class {
    constructor() {
        this.users =  new Users()
        this.items = new Items()
        this.battles = new Battles()

    }

    getMonsterInfo(monster, level) {

        return new Promise((resolve, reject) => {
            if(!monster) reject('Specify a monster name')
            if(!level) reject('Specify a level name')

            fs.readFile('./src/assets/JSON/monster.json').then(function (mst) {
                const monsters = JSON.parse(mst)
                if(!monsters.level[level.toLowerCase()]){
                    reject("This level doesn\'t exist\nLevel list: " + Object.keys(monsters.level))
                }
                if(!monsters.level[level.toLowerCase()][monster.toLowerCase()]){
                    reject("This monster doesn\'t exist\nMonster list: " + Object.keys(monsters.level[level.toLowerCase()]))
                }
                const stats = monsters.level[level.toLowerCase()][monster.toLowerCase()].stats
                fs.readFile('./src/assets/JSON/loottable.json').then(function (lootlist) {
                    const loots = JSON.parse(lootlist)
                    const loottable = loots[monster.toLowerCase()]
                    fs.readFile('./src/assets/JSON/object.json').then(function (obj) {
                        const objs = JSON.parse(obj)
                        let loot = {}
                        for (const lootobj of loottable) {
                            if (objs.loot[lootobj.name]) {
                                Object.assign(loot, {
                                    [lootobj.name]: [objs.loot[lootobj.name]]
                                })
                            }
                        }
                        resolve({monster, stats, loot})
                    }).catch((err) =>{
                        reject(err)
                    })
                }).catch((err) =>{
                    reject(err)
                })
            }).catch((err) =>{
                reject(err)
            })
        })
    }
}
