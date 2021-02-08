const fs = require('fs/promises')



    class Battle {
        startDungeon(name, profile) {
            return new Promise((resolve, reject) => {
                fs.readFile('./src/assets/JSON/dungeons.json').then(function (dungeons) {
                    fs.readFile('./src/assets/database/users.json').then(function (users) {
                        const stringifyUsers = JSON.parse(users)
                        const stringifyDungeons = JSON.parse(dungeons)
                        if (!stringifyUsers[profile]) {
                            reject("Cette utilisateur n'existe pas")
                        }
                        if (!stringifyDungeons[name]) {
                            reject("Ce donjon n'existe pas")
                        }
                        let user = stringifyUsers[profile]
                        Object.assign(user.dungeons.begin, {[name]: stringifyDungeons[name].loot})
                        console.log(user)
                        fs.writeFile('./src/assets/database/users.json', JSON.stringify(user, null, 4)).then(() => {
                            resolve({message: "Nouveau donjon commencé"})
                        }).catch((err) => {
                            reject(err)
                        })
                    })
                })
            })
        }

        fightDungeon(name, profile) {
            const Monsters = require('../lib/Monsters')
            const monsters = new Monsters()
            return new Promise((resolve, reject) => {
                fs.readFile('./src/assets/JSON/dungeons.json').then(function (dungeons) {
                    fs.readFile('./src/assets/database/users.json').then(function (users) {
                        const stringifyUsers = JSON.parse(users)
                        const stringifyDungeons = JSON.parse(dungeons)
                        if (!stringifyUsers[profile]) {
                            reject("Cette utilisateur n'existe pas")
                        }
                        if (!stringifyDungeons[name]) {
                            reject("Ce donjon n'existe pas")
                        }
                        let user = stringifyUsers[profile]
                        let dungeon = stringifyDungeons[name]
                        monsters.getMonsterInfo(Battle.selectMonster(dungeon.monster[Battle.calcLvl(user)]), Battle.calcLvl(user)).then((data) =>{
                            let userpv = user.info.stats.hp
                            let userAttack = (user.info.stats.stats.atk - data.stats.def)

                            let monsterpv = data.stats.pv
                            let monsterAttack = (data.stats.atk - user.info.stats.stats.def)
                            let result = {}
                            let turn = 0
                            let isCriticalUser = false
                            let isCriticalMonster = false

                            //combat
                            while (userpv >= 0 && monsterpv >= 0){

                                if(Battle.randomInt() <= (user.info.stats.stats.ctr)*100){
                                    userAttack = userAttack*2
                                    isCriticalUser = true
                                }
                                if(Battle.randomInt() <= (data.stats.ctr)*100){
                                    monsterAttack = monsterAttack*2
                                    isCriticalMonster = true
                                }

                                turn++
                                monsterpv = monsterpv - userAttack
                                userpv = userpv - monsterAttack
                                Object.assign(result,{
                                    [turn]:{
                                        [profile]:{
                                            pv:userpv,
                                            attack:user.info.stats.stats.atk,
                                            defence:user.info.stats.stats.def,
                                            effectiveAttack:userAttack,
                                            critical : isCriticalUser
                                        },
                                        [data.monster]:{
                                            pv:monsterpv,
                                            attack:data.stats.atk,
                                            defence:data.stats.def,
                                            effectiveAttack:monsterAttack,
                                            critical : isCriticalMonster

                                        }
                                    },
                                })
                            }

                            resolve(result)
                        })
                    })
                })
            })
        }

        static calcLvl(user) {
            if (user.info.level < 20) {
                return 'low'
            }
        }

        static selectMonster(array){
            return array[Math.floor(Math.random()*array.length)];
        }

        static randomInt(){
            return Math.floor(Math.random()*100)
        }
    }
module.exports = Battle
