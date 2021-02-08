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
                            let monsterpv = data.stats.pv
                            let result = {}
                            let turn = 0

                            //combat
                            while (userpv >= 0 && monsterpv >= 0){
                                //Set stats
                                let attackMonsterStats = {
                                    dodge:false,
                                    crit:false
                                }
                                let attackUserStats = {
                                    dodge:false,
                                    crit:false
                                }

                                let userAttack = (user.info.stats.stats.atk - data.stats.def)
                                let monsterAttack = (data.stats.atk - user.info.stats.stats.def)


                                //DODGE

                                if(Battle.randomInt() <= (user.info.stats.stats.spd)*100){
                                    attackUserStats.dodge = true

                                }

                                if(Battle.randomInt() <= (data.stats.spd)*100){
                                    attackMonsterStats.dodge = true

                                }

                                //CRIT

                                if(!attackUserStats.dodge){
                                    if(Battle.randomInt() <= (data.stats.ctr)*100){
                                        monsterAttack = monsterAttack*2
                                        attackMonsterStats.crit = true
                                    }
                                    userpv = userpv - monsterAttack
                                }

                                if(!attackMonsterStats.dodge){
                                    if(Battle.randomInt() <= (user.info.stats.stats.ctr)*100){
                                        userAttack = userAttack*2
                                        attackUserStats.crit = true
                                    }
                                    monsterpv = monsterpv - userAttack
                                }

                                //Make combat result
                                turn++
                                Object.assign(result,{
                                    [turn]:{
                                        [profile]:{
                                            pv:userpv,
                                            attack:user.info.stats.stats.atk,
                                            defence:user.info.stats.stats.def,
                                            effectiveAttack:userAttack,
                                            attackUserStats
                                        },
                                        [data.monster]:{
                                            pv:monsterpv,
                                            attack:data.stats.atk,
                                            defence:data.stats.def,
                                            effectiveAttack:monsterAttack,
                                            attackMonsterStats

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
