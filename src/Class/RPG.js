const Ora = require('ora')

module.exports = class {
    constructor() {

    }
    init(){
        const spinners = {
            dbS : new Ora("Connexion à la base de donnée"),
            verification : new Ora("Vérification des variables d'environement").start(),
            discord : new Ora("Connexion à l'api Discord"),
        };
        setTimeout(function () {
            spinners.verification.succeed('Oui')
            spinners.dbS.start()
            setTimeout(function () {
                spinners.dbS.succeed('Oui')
                spinners.discord.start()
ZZ
                setTimeout(function () {
                    spinners.discord.succeed('Oui')

                },2500)
            },2500)
        },2500)
    }

    getMonsterInfo(monster, level){
        const fs =require('fs')
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/monster.json', ((err, mst) => {
                if(err) reject(err)

                const monsters = JSON.parse(mst)
                const stats = monsters.level[level][monster].stats
                fs.readFile('./src/assets/JSON/loottable.json', ((err, lootlist) => {
                    if(err) reject(err)

                    const loots = JSON.parse(lootlist)
                    const loottable = loots[monster]
                    fs.readFile('./src/assets/JSON/object.json', ((err, obj) => {
                        if(err) reject(err)
                        const objs = JSON.parse(obj)
                        let loot = {}
                        for (const lootobj of loottable){
                            if(objs.loot[lootobj.name]) {
                                Object.assign(loot,{
                                    [lootobj.name]:{
                                        info:objs.loot[lootobj.name]
                                    }})
                            }
                        }
                        resolve({monster, stats, loot})
                    }))
                }))
            }))
        })

    }

}
