const fs = require('fs/promises')

    class Battle {

        startDungeon(name, profile) {
            return new Promise((resolve, reject) => {
                fs.readFile('./src/assets/JSON/dungeons.json').then(function (dungeons) {
                    dungeons = JSON.parse(dungeons)
                    fs.readFile('./src/assets/database/users.json').then(function (users) {

                        users = JSON.parse(users)
                        let selectedDungeon = dungeons[name];
                        let selectedUser = users[profile]
                        selectedUser.dungeons.begin[name] = {}

                        Object.assign(selectedUser.dungeons.begin[name],selectedDungeon.loot)
                        let stringifyUsers = JSON.stringify(users, null, 2)


                        fs.writeFile('./src/assets/database/users.json', stringifyUsers).then(() => {
                            resolve({message: "Nouveau donjon commencé"})
                        }).catch((err) => {
                            reject(err)
                        })
                    })
                })
            })
        }

        fightDungeon(name, profile) {
            //random dungeon
            if(name === 'random') {

                Battle.randomDungeon(profile).then((djn) =>{
                    name = djn
                })
            }

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
                        if(!stringifyUsers[profile].dungeons.begin[name]){
                            reject("Ce donjon n'est pas commencé")
                        }
                        let user = stringifyUsers[profile]
                        let dungeon = stringifyDungeons[name]
                        monsters.getMonsterInfo(Battle.selectRandomThings(dungeon.monster[Battle.calcLvl(user)]), Battle.calcLvl(user)).then((data) =>{
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
                            Battle.obtainLoot(data,user).then(()=>{
                                fs.writeFile('./src/assets/database/users.json', JSON.stringify(stringifyUsers, null, 2)).then(() => {
                                    resolve({message: "Nouveau donjon commencé"})
                                }).catch((err) => {
                                    reject(err)
                                })
                            })
                            resolve(result)
                        })
                    })
                })
            })
        }

        static randomDungeon(username){
            return new Promise((resolve, reject) => {
                fs.readFile('./src/assets/database/users.json').then(function (users) {
                    let parsed = JSON.parse(users)
                    resolve(Object.keys(parsed[username].dungeons.begin)[Math.floor(Math.random()*Object.keys(parsed[username].dungeons.begin).length)])
                }).catch((err)=>{
                    reject(err)
                })
            })

        }

        //TODO Fix erase old loot

        static obtainLoot(monster,profile){
            return new Promise((resolve, reject) => {
                const loots = monster.loot
                let gainloot = {}
                let lengthloot = 0

                for(const lootname in loots){
                    let loot = loots[lootname]

                    for(let i = 0;i<=loot.data.lengthMax;i++){
                        if(Battle.randomInt() <= (loot.data.proba)*100){
                            lengthloot++
                        }
                    }
                    Object.assign(gainloot,{
                        [loot.data.name]:lengthloot + (profile.inventory.item[loot.data.name] ? profile.inventory.item[loot.data.name].length : 0)
                    })
                }

                let inventory = profile.inventory
                for(const givedLoot in gainloot){
                    if(givedLoot !== 'xp'){
                        Object.assign(inventory.item, {[givedLoot]: gainloot[givedLoot]})
                    } else {
                        profile.info.xp += gainloot["xp"].length
                    }
                }
                const User = require('../lib/Users')
                const userManager = new User()

                userManager.levelup(profile).then((user) =>{
                    resolve(user)
                })
            })

        }

        static calcLvl(user) {
            if (user.info.level < 20) {
                return 'low'
            }
        }

        static selectRandomThings(array){
            return array[Math.floor(Math.random()*array.length)];
        }

        static randomInt(){
            return Math.floor(Math.random()*100)
        }
    }
module.exports = Battle
