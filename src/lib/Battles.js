const fs = require('fs/promises')
const utils = require('../utils/utils')
    class Battle {
        constructor() {

        }
        /**
         * Start dungeons
         * @param {String<dungeonName>} name dungeon name
         * @param {String<uuid>} profile user uuid
         * @returns {Promise<message>} Return message
         */
        startDungeon(name, profile) {
            return new Promise((resolve, reject) => {
                fs.readFile('./src/assets/JSON/dungeons.json').then(function (dungeons) {
                    dungeons = JSON.parse(dungeons)
                    fs.readFile('./src/assets/database/users.json').then(function (users) {

                        users = JSON.parse(users)
                        let selectedDungeon = dungeons[name];
                        let selectedUser = users[profile]
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
                            reject({message: err})
                        })
                    })
                })
            })
        }

        /**
         * Made Battle
         * @param {String<dungeonName>} name dungeon name
         * @param {String<uuid>} profile user uuid
         * @returns {Promise<result>} Return data
         */

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
                        if (!stringifyUsers[profile]) {
                            reject({message:"Cette utilisateur n'existe pas"})
                        }
                        if (!stringifyDungeons[name]) {
                            reject({message:"Ce donjon n'existe pas"})
                        }
                        if(!stringifyUsers[profile].dungeons.begin[name]){
                            reject({message:"Ce donjon n'est pas commencé"})
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

                                let userAttack = (user.info.stats.perks.stats.attack - data.stats.defence)
                                let monsterAttack = (data.stats.attack - user.info.stats.perks.stats.defence)


                                //DODGE

                                if(Battle.randomInt() <= (user.info.stats.perks.stats.speed)*100){
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
                                    if(Battle.randomInt() <= (user.info.stats.perks.stats.critic)*100){
                                        userAttack = userAttack*2
                                        attackUserStats.crit = true
                                    }
                                    monsterpv = monsterpv - userAttack
                                }

                                //Make combat result
                                turn++
                                Object.assign(result,{
                                    [turn]:{
                                        [user.name]:{
                                            pv:userpv,
                                            attack:user.info.stats.perks.stats.attack,
                                            defence:user.info.stats.perks.stats.defence,
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

                            if(userpv <= 0) {
                                resolve({data: result, message:'Joueur perdu'})
                            }else{
                                Battle.orbLoot( name,stringifyUsers,profile).then((stringifyLootOrb)=>{
                                    Battle.rareLoot(stringifyDungeons[name], name,stringifyLootOrb,profile).then((stringifyLootRate)=>{
                                        Battle.obtainLoot(data,stringifyLootRate,profile).then((data)=>{
                                            Battle.EndDungeon(data,name,profile).then((data)=>{
                                                Object.assign(result.loot, data.loot)
                                                resolve({data: result, message: 'Joueur gagner'})
    
                                                fs.writeFile('./src/assets/database/users.json', JSON.stringify(data.user, null, 2))
                                            })
                                        })
                                    })
                                })
                            }
                        })
                    })
                })
            })
        }

        /**
         * Fight a boss
         * @param {String<username>} profile user uuid
         * @returns {Promise<battleResult>}
         */

        fightBosse(profile) {
            return new Promise((resolve, reject) => {
                fs.readFile('./src/assets/JSON/monster.json').then(function (monsters) {
                    fs.readFile('./src/assets/database/users.json').then(function (users) {

                        const parseMonster = JSON.parse(monsters)
                        const parseUsers = JSON.parse(users)

                        const user = parseUsers[profile]
                        if (!user) {
                            reject({message: "Utilisateur introuvable"})
                        }
                        let levelMonster = Battle.calcLvl(user)

                        Battle.MakeBosses(Object.keys(parseMonster.level[levelMonster]), user).then((data) => {
                            let userpv = user.info.stats.health
                            let monsterpv = data.stats.pv
                            let result = {
                                battles:{},
                                loot:{}
                            }
                            let turn = 0

                            while (userpv >= 0 && monsterpv >= 0) {

                                //Set stats
                                let attackMonsterStats = {
                                    dodge: false,
                                    crit: false
                                }
                                let attackUserStats = {
                                    dodge: false,
                                    crit: false
                                }

                                let userAttack = (user.info.stats.perks.stats.attack - data.stats.defence)
                                let monsterAttack = (data.stats.attack - user.info.stats.perks.stats.defence)


                                //DODGE

                                if (Battle.randomInt() <= (user.info.stats.perks.stats.speed) * 100) {
                                    attackUserStats.dodge = true

                                }

                                if (Battle.randomInt() <= (data.stats.speed) * 100) {
                                    attackMonsterStats.dodge = true

                                }

                                //CRIT

                                if (!attackUserStats.dodge) {
                                    if (Battle.randomInt() <= (data.stats.critic) * 100) {
                                        monsterAttack = monsterAttack * 2
                                        attackMonsterStats.crit = true
                                    }
                                    userpv = userpv - monsterAttack
                                }

                                if (!attackMonsterStats.dodge) {
                                    if (Battle.randomInt() <= (user.info.stats.perks.stats.critic) * 100) {
                                        userAttack = userAttack * 2
                                        attackUserStats.crit = true
                                    }
                                    monsterpv = monsterpv - userAttack
                                }

                                //Make combat result
                                turn++
                                Object.assign(result.battles, {
                                    [turn]: {
                                        [user.name]: {
                                            pv: userpv,
                                            attack: user.info.stats.perks.stats.attack,
                                            defence: user.info.stats.perks.stats.defence,
                                            effectiveAttack: userAttack,
                                            attackUserStats
                                        },
                                        [data.monster]: {
                                            pv: monsterpv,
                                            attack: data.stats.attack,
                                            defence: data.stats.defence,
                                            effectiveAttack: monsterAttack,
                                            attackMonsterStats

                                        }
                                    },
                                })
                            }
                            if(userpv <= 0) {
                                resolve({data: result, message:  'Joueur perdu'})
                            }else{
                                Battle.obtainLoot(data, parseUsers, profile).then((data) => {
                                    Object.assign(result.loot, data.loot)
                                    resolve({data: result, message: 'Joueur gagner'})
    
                                    fs.writeFile('./src/assets/database/users.json', JSON.stringify(data.user, null, 2))
                                })
                            }
                            

                        })
                    })
                })
            })

        }

        //TODO
        // - PVP
        // - Bosses

        /**
         * Select a random dungeons if dungeons is not specified
         * @param {String<username>} username user name
         * @returns {Promise<dungeon>}
         */

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

        /**
         * Give mod and dungeons loot
         * @param monster monster data
         * @param {Object<UsersData>} stringifyUsers users
         * @param {String<uuid>} profile user name
         * @returns {Promise<users>} return users
         */

        static obtainLoot(monster,stringifyUsers,profile){
            return new Promise((resolve, reject) => {
                const loots = monster.loot
                const user = stringifyUsers[profile]
                let Allloot = {}
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
                    Object.assign(Allloot,{
                        [loot.data.name]:lengthloot + (user.inventory.item[loot.data.name] || 0)
                    })
                    Object.assign(gainloot,{
                        [loot.data.name]:lengthloot
                    })
                }

                let inventory = user.inventory

                //XP
                for(const givedLoot in Allloot){
                    if(givedLoot !== 'xp'){
                        Object.assign(inventory.item, {[givedLoot]: Allloot[givedLoot]})
                    } else {
                        user.info.xp += Allloot["xp"]
                    }
                }



                const User = require('../lib/Users')
                const userManager = new User()

                userManager.levelup(user).then((user) =>{
                    resolve({user : stringifyUsers, loot: gainloot})
                })
            })

        }
        //FIXME
        // - Rework monster level

        /**
         * Calc monster level
         * @param {Object<user>} user User profile data
         * @returns {string}
         */
        static calcLvl(user) {
            return 'low'
        }

        /**
         * Give rareloot
         * @param {Object<dungeonData>}dungeon dungeon data
         * @param {String<dungeonName>}name dungeon name
         * @param {Object<UsersData>} stringifyUsers users data
         * @param {String<uuid>} profile user name
         * @returns {Promise<users>} return users
         */

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

        /**
         * Give orb loot
         * @param {String<dungeonName>} name dungeon name
         * @param {Object<UsersData>} stringifyUsers users data
         * @param {String<uuid>} profile user name
         * @returns {Promise<users>} return users
         */

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

        /**
         * End dungeons is all loot and rareloot is empty
         * @param {Object<allStringifyUser>}stringifyUser users data
         * @param {String<dungeonName>}name dungeon name
         * @param {String<uuid>} profile user name
         * @returns {Promise<users>} return users
         */

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

        /**
         * Make bosses
         * @param monsterList {Array<monster>} monster list
         * @param  {Object<user>} profile  user profile data
         * @returns {Promise<boss>} return boss stats
         * @constructor
         */

        static MakeBosses(monsterList,profile) {
            const Monsters = require('../lib/Monsters')
            const monsters = new Monsters()
            return new Promise((resolve, reject) => {
                if(!Array.isArray(monsterList)){
                    reject({message:"La liste de monstre n'est pas une liste"})
                }

                if(typeof profile !== "object" || !profile.info){
                    reject({message: "Le profile indique n'est pas un utilisateur ou l'utilisateur n'est pas complet"})
                }
                monsters.getMonsterInfo(Battle.selectRandomThings(monsterList), Battle.calcLvl(profile)).then((data) => {
                    Battle.boostMonster(data).then((boss) =>{
                        resolve(boss)
                    })
                })
            })
        }



        /**
         * Make monster as bosses
         * @param {Object<monster>}monster monster data
         * @param multiple {Number<number>} stats multiplicator default : 2
         * @returns {Promise<monster>} a boosted Monster
         */

        static boostMonster(monster,multiple =this){
            return new Promise((resolve, reject) => {
                utils.readXML("bosses").then((data) =>{
                    const statsKey = Object.keys(monster.stats)
                    for(const stats of statsKey){
                        monster.stats[stats] = monster.stats[stats]*data.rpg.bossesconf.multiplicatorStat._text
                    }
                    const lootKey = Object.keys(monster.loot)
                    for (const loot of lootKey){
                        monster.loot[loot].data.lengthMax = monster.loot[loot].data.lengthMax*data.rpg.bossesconf.multiplicatorStuff._text
                    }

                    if(monster.stats.speed >= 0.8) monster.stats.speed = 0.8
                    if(monster.stats.critic >= 0.8) monster.stats.critic = 0.8


                    resolve(monster)
                })

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
