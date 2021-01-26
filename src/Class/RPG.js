const Ora = require('ora')
const fs = require('fs/promises')
const Utils = require('../Utils/index')
module.exports = class {
    constructor() {
        this.utils = new Utils()

    }
    getItemInfo(type,name) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/object.json').then(function (obj) {
                const objs = JSON.parse(obj)
                resolve(objs[type][name])
            }).catch(err =>{
                reject(err)
            })
        })
    }

    getMonsterInfo(monster, level) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/monster.json').then(function (mst) {
                const monsters = JSON.parse(mst)
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
