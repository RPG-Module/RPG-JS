const fs = require('fs/promises')
module.exports = class {
    constructor() {

    }

    getMonsterInfo(monster, level) {
         monster = monster.replace(/^\w/, c => c.toUpperCase());

        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/monster.json').then(function (mst) {
                const monsters = JSON.parse(mst)
                if(!monsters.level[level]){
                    reject("This level doesn\'t exist\nLevel list: " + Object.keys(monsters.level))
                }
                if(!monsters.level[level][monster]){
                    reject("This monster doesn\'t exist\nMonster list: " + Object.keys(monsters.level[level]))
                }
                const stats = monsters.level[level][monster].stats
                fs.readFile('./src/assets/JSON/loottable.json').then(function (lootlist) {
                    const loots = JSON.parse(lootlist)
                    const loottable = loots[monster]
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
