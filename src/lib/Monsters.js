const fs = require('fs/promises')

class Monsters{
// TODO
// - Make Bosses

    /**
     * Get monster stats and all info
     * @param monster {String<monsterName>} Monster name
     * @param level {String<levelMonster>} the monster level (see monster.json)
     * @returns {Promise<monster>} Return monster
     */
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
                    fs.readFile('./src/assets/JSON/items.json').then(function (obj) {
                        const objs = JSON.parse(obj)
                        let loot = {}
                        for (const lootobj of loottable) {
                            if (objs.items[lootobj.name.toLowerCase()]|| lootobj.name.toLowerCase() === 'xp') {
                                Object.assign(loot, {
                                    [lootobj.name]: {data : lootobj, info: objs.items[lootobj.name.toLowerCase()] || null}
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
module.exports = Monsters
