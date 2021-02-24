const fs = require('fs/promises')

    class Battle {
        startDungeon(name, profile) {
            return new Promise((resolve, reject) => {
                fs.readFile('./src/assets/JSON/dungeons.json').then(function (dungeons) {
                    dungeons = JSON.parse(dungeons)
                    fs.readFile('./src/assets/database/users.json').then(function (users) {

                        users = JSON.parse(users)
                        let selectedDungeon = dungeons[name];
                        let selectedUser = users[profile.toLowerCase()]
                        if(!selectedUser){
                            reject({message:"Cette utilisateur n'existe pas"})
                        }
                        if (!selectedDungeon) {
                            reject({message:"Ce donjon n'existe pas"})
                        }
                        if(selectedUser.dungeons.end[name]){
                            reject({message:"Ce donjon est deja fini"})
                        }
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

                Battle.randomDungeon(profile.toLowerCase()).then((djn) =>{
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
                        if (!stringifyUsers[profile.toLowerCase()]) {
                            reject({message:"Cette utilisateur n'existe pas"})
                        }
                        if (!stringifyDungeons[name]) {
                            reject({message:"Ce donjon n'existe pas"})
                        }
                        if(!stringifyUsers[profile.toLowerCase()].dungeons.begin[name]){
                            reject({message:"Ce donjon n'est pas commencé"})
                        }
                        let user = stringifyUsers[profile.toLowerCase()]
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

                                let userAttack = (user.info.stats.stats.attack - data.stats.defence)
                                let monsterAttack = (data.stats.attack - user.info.stats.stats.defence)


                                //DODGE

                                if(Battle.randomInt() <= (user.info.stats.stats.speed)*100){
                                    attackUserStats.dodge = true

                                }

                                if(Battle.randomInt() <= (data.stats.speed)*100){
                                    attackMonsterStats.dodge = true

                                }

                                //CRIT

                                if(!attackUserStats.dodge){
                                    if(Battle.randomInt() <= (data.stats.critic)*100){
                                        monsterAttack = monsterAttack*2
                                        attackMonsterStats.crit = true
                                    }
                                    userpv = userpv - monsterAttack
                                }

                                if(!attackMonsterStats.dodge){
                                    if(Battle.randomInt() <= (user.info.stats.stats.critic)*100){
                                        userAttack = userAttack*2
                                        attackUserStats.crit = true
                                    }
                                    monsterpv = monsterpv - userAttack
                                }

                                //Make combat result
                                turn++
                                Object.assign(result,{
                                    [turn]:{
                                        [profile.toLowerCase()]:{
                                            pv:userpv,
                                            attack:user.info.stats.stats.attack,
                                            defence:user.info.stats.stats.defence,
                                            effectiveAttack:userAttack,
                                            attackUserStats
                                        },
                                        [data.monster]:{
                                            pv:monsterpv,
                                            attack:data.stats.attack,
                                            defence:data.stats.defence,
                                            effectiveAttack:monsterAttack,
                                            attackMonsterStats

                                        }
                                    },
                                })
                            }



                            Battle.orbLoot( name,stringifyUsers,profile.toLowerCase()).then((stringifyLootOrb)=>{
                                Battle.rareLoot(stringifyDungeons[name], name,stringifyLootOrb,profile.toLowerCase()).then((stringifyLootRate)=>{
                                    Battle.obtainLoot(data,stringifyLootRate,profile.toLowerCase()).then((data)=>{
                                        console.log(profile)
                                        console.log(name)

                                        Battle.EndDungeon(data,name,profile.toLowerCase()).then((data)=>{
                                            fs.writeFile('./src/assets/database/users.json', JSON.stringify(data, null, 2))
                                        })
                                    })
                                })
                            })
                            resolve(result)
                        })
                    })
                })
            })
        }

        //TODO
        // - PVP
        // - Bosses

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

        static obtainLoot(monster,stringifyUsers,profile){
            return new Promise((resolve, reject) => {
                const loots = monster.loot
                const user = stringifyUsers[profile.toLowerCase()]
                let gainloot = {}
                let lengthloot = 0

                //LOOT
                for(const lootname in loots){
                    let loot = loots[lootname]
                    for(let i = 0;i<=loot.data.lengthMax;i++){
                        if(Battle.randomInt() <= (loot.data.proba)*100){
                            lengthloot++
                        }
                    }
                    Object.assign(gainloot,{
                        [loot.data.name]:lengthloot + (user.inventory.item[loot.data.name] || 0)
                    })
                }

                let inventory = user.inventory

                //XP
                for(const givedLoot in gainloot){
                    if(givedLoot !== 'xp'){
                        Object.assign(inventory.item, {[givedLoot]: gainloot[givedLoot]})
                    } else {
                        user.info.xp += gainloot["xp"]
                    }
                }



                const User = require('../lib/Users')
                const userManager = new User()

                userManager.levelup(user).then((user) =>{
                    resolve(stringifyUsers)
                })
            })

        }
        //FIXME
        // - Rework monster level
        static calcLvl(user) {
            return 'low'
        }

        static rareLoot(dungeon,name,stringifyUsers,profile){
            return new Promise((resolve, reject) => {
                const chests = dungeon.loot.chest
                const keys = dungeon.loot.keys
                const reputation = dungeon.loot.reputation
                const user = stringifyUsers[profile.toLowerCase()]
                const rareloot = user.dungeons.begin[name].rareLoot
                //reputation
                    if(user.dungeons.begin[name].reputation) {
                        if (Battle.randomInt() <= (reputation.proba) * 100) {
                            user.info.reputation++
                            user.dungeons.begin[name].reputation.size--
                            if (user.dungeons.begin[name].reputation.size <= 0) {
                                delete user.dungeons.begin[name].reputation
                            }
                        }

                    }

                //Chest
                for(const chest in chests){
                    if(user.dungeons.begin[name].chest[chest]){
                        if(Battle.randomInt() <= (chests[chest].proba)*100){
                            Object.assign(user.chest, {
                                [chest]:1 + (user.chest[chest] ?  user.chest[chest] : 0)
                            })
                            delete user.dungeons.begin[name].chest[chest]
                        }
                    }
                }

                //Keys
                for(const key in keys){
                    if(user.dungeons.begin[name].keys[key]){
                        if(Battle.randomInt() <= (keys[key].proba)*100){
                            Object.assign(user.inventory.keys, {
                                [key]:1 + (user.inventory.keys[key] || 0)
                            })
                            delete user.dungeons.begin[name].keys[key]

                        }
                    }
                }

                //Rareloot
                let rareLootTypes = Object.keys(rareloot)
                if(rareloot["weapons"]){
                    let rareLootWeapons = Object.keys(rareloot["weapons"])
                    let loot = {}
                    for(const type of rareLootTypes){
                        Object.assign(loot, {
                            [type]: {}
                        })
                        for(const weapon of rareLootWeapons){
                            const material = Battle.selectRandomThings(rareloot["weapons"][weapon].material)
                            Object.assign(loot.weapons, {
                                [weapon]:{
                                    material : {}
                                }
                            })
                            Object.assign(loot["weapons"][weapon].material,{[material]: 1 +(loot["weapons"][weapon].material[material] || 0)})
                            let pos = rareloot["weapons"][weapon].material.indexOf(material)
                            rareloot["weapons"][weapon].material.splice(pos,1)
                            if(rareloot["weapons"][weapon].material.length === 0 ){
                                delete rareloot["weapons"][weapon]
                                if(Object.entries(rareloot["weapons"]).length === 0){
                                    delete rareloot["weapons"]
                                }
                            }
                        }
                        Object.assign(user.inventory.stuff,loot)
                    }
                }
                resolve(stringifyUsers)
            })


        }

        static orbLoot(name,stringifyUsers,profile) {
            return new Promise((resolve, reject) => {
                const orbs = stringifyUsers[profile].dungeons.begin[name].orb
                let keysObject = Object.keys(orbs)

                for (const orb of keysObject) {
                    if (Battle.randomInt() <= (0.25 * 100)) {
                        if (orbs[orb]) {
                            Object.assign(stringifyUsers[profile].inventory.orbs, {
                                [orb]: 1 + (stringifyUsers[profile].inventory.orbs[orb] || 0)
                            })
                            delete orbs[orb]
                        }else{
                            delete orbs[orb]
                        }
                    }
                }
                resolve(stringifyUsers)

            })

        }

        static EndDungeon(stringifyUser,name,profile){
            return new Promise((resolve, reject) => {
                const dungeon = stringifyUser[profile].dungeons.begin[name]

                const ObjectKey = Object.keys(dungeon)
                let isEmpty = true

                for(const key of ObjectKey){
                    if(!isEmpty){
                        if(Object.entries(dungeon[key]).length !== 0){
                            isEmpty = true
                        }
                    }
                }
                if(isEmpty){
                    stringifyUser[profile].dungeons.end[name] = stringifyUser[profile].dungeons.begin[name]
                    delete stringifyUser[profile].dungeons.begin[name]
                }
                resolve(stringifyUser)
            })
        }

        static selectRandomThings(array){
            return array[Math.floor(Math.random()*array.length)];
        }

        static randomInt(){
            return Math.floor(Math.random()*100)
        }
    }
module.exports = Battle
