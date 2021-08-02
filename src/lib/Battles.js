const fs = require('fs/promises')
const utils = require('../compenants/utils')
    class Battle {
        constructor() {

        }
        /**
         * Start dungeons
         * @param {String<dungeonName>} name dungeon name
         * @param {String<id>} id user id
         * @returns {Promise<message>} Return message
         */
        startDungeon(name, id) {
            return new Promise((resolve, reject) => {
                fs.readFile('./src/assets/JSON/dungeons.json').then(function (dungeons) {
                    dungeons = JSON.parse(dungeons)
                    fs.readFile('./src/assets/database/users.json').then(function (users) {

                        users = JSON.parse(users)
                        let selectedDungeon = dungeons[name];
                        let selectedUser = users[id]

                        if(!selectedUser){
                            reject({message:"Cette utilisateur n'existe pas"})
                        }
                        if (!selectedDungeon) {
                            reject({message:"Ce donjon n'existe pas"})
                        }
                        if(selectedUser.dungeons.begin[name]){
                            reject({message:"Ce donjon est deja commencé"})
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
         * @param {String<id>} id user id
         * @returns {Promise<result>} Return data
         */

        fightDungeon(name, id) {
            //random dungeon
            if(name === 'random') {

                Battle.randomDungeon(id.toLowerCase()).then((djn) =>{
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
                        if (!stringifyUsers[id]) {
                            reject({message:"Cette utilisateur n'existe pas"})
                        }
                        if (!stringifyDungeons[name]) {
                            reject({message:"Ce donjon n'existe pas"})
                        }
                        if(!stringifyUsers[id].dungeons.begin[name]){
                            reject({message:"Ce donjon n'est pas commencé"})
                        }
                        let user = stringifyUsers[id]
                        let dungeon = stringifyDungeons[name]
                        monsters.getMonsterInfo(Battle.selectRandomThings(dungeon.monster[Battle.calcLvl(user)]), Battle.calcLvl(user)).then((data) =>{
                            let userpv = user.info.stats.health
                            let monsterpv = data.stats.pv
                            let result = {
                                fight:{},
                                loot:{}
                            }
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
                                Object.assign(result.fight,{
                                    [turn]:{
                                        [user.name]:{
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

                            if(userpv <= 0) {
                                stringifyUsers[user.id].info.stats.health = 0
                                resolve({data: result, message:  'Joueur perdu'})
                            }else{
                                stringifyUsers[user.id].info.stats.health = userpv
                                console.log(data)
                                        Battle.obtainLoot(data,stringifyUsers,user.id,name).then((data)=>{
                                            Battle.EndDungeon(data,name,user.id).then((data)=>{
                                                Object.assign(result.loot, data.loot)
                                                resolve({data: result, message: 'Joueur gagner'})

                                                fs.writeFile('./src/assets/database/users.json', JSON.stringify(data.user, null, 2))
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
         * @param {Snowflake<id>} id user id
         * @returns {Promise<battleResult>}
         */

        fightBosse(id) {
            return new Promise((resolve, reject) => {
                fs.readFile('./src/assets/JSON/monster.json').then(function (monsters) {
                    fs.readFile('./src/assets/database/users.json').then(function (users) {

                        const parseMonster = JSON.parse(monsters)
                        const parseUsers = JSON.parse(users)

                        const user = parseUsers[id]
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
                                parseUsers[id].info.stats.health = 0
                                resolve({data: result, message:  'Joueur perdu'})
                            }else{
                                parseUsers[id].info.stats.health = userpv
                                Battle.obtainLoot(data, parseUsers, id).then((data) => {

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
         * @param {String<username>} id user name
         * @param dungeonName
         * @returns {Promise<users>} return users
         */

        static obtainLoot(monster,stringifyUsers,id,dungeonName){
            return new Promise((resolve, reject) => {
                const loots = monster.loot
                const user = stringifyUsers[id]
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

                Battle.orbLoot(dungeonName,stringifyUsers,id).then((data) =>{
                    Object.assign(gainloot, data.loot)
                    Battle.rareLoot(dungeonName,stringifyUsers,id).then((data) => {
                        Object.assign(gainloot, data.loot)
                        console.log(gainloot)
                        userManager.levelup(user).then((user) =>{
                            resolve({user : stringifyUsers, loot: gainloot})
                        })
                    })
                })




            })

        }
        //FIXME
        // - Rework monster level

        /**
         * Calc monster level
         * @param {Object<user>} user User id data
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
         * @param {String<id>} id user name
         * @returns {Promise<users>} return users
         */

        static rareLoot(name,stringifyUsers,id) {
            return new Promise((resolve, reject) => {
                fs.readFile('./src/assets/JSON/dungeons.json').then(function(dungeons) {
                    const stringifyDungeons = JSON.parse(dungeons)
                    const dungeon = stringifyDungeons[name]
                    const chests = dungeon.loot.chest
                    const keys = dungeon.loot.keys
                    const reputation = dungeon.loot.reputation
                    let gainloot = {}
                    console.log(stringifyUsers)
                    const user = stringifyUsers[id.toLowerCase()]
                    const rareloot = user.dungeons.begin[name].rareLoot
                    //reputation
                    if ( user.dungeons.begin[name].reputation ) {
                        if ( Battle.randomInt() <= ( reputation.proba ) * 100 ) {
                            user.info.reputation++
                            user.dungeons.begin[name].reputation.size--
                            Object.assign(gainloot, {
                                reputation: 1
                            })
                            if ( user.dungeons.begin[name].reputation.size <= 0 ) {
                                delete user.dungeons.begin[name].reputation
                            }
                        }

                    }

                    //Chest
                    for ( const chest in chests ) {
                        if ( user.dungeons.begin[name].chest[chest] ) {
                            if ( Battle.randomInt() <= ( chests[chest].proba ) * 100 ) {
                                Object.assign(user.chest, {
                                    [chest]: 1 + ( user.chest[chest] ? user.chest[chest] : 0 )
                                })
                                Object.assign(gainloot, {
                                    [chest]: 1
                                })
                                delete user.dungeons.begin[name].chest[chest]
                            }
                        }
                    }

                    //Keys
                    for ( const key in keys ) {
                        if ( user.dungeons.begin[name].keys[key] ) {
                            if ( Battle.randomInt() <= ( keys[key].proba ) * 100 ) {
                                Object.assign(user.inventory.keys, {
                                    [key]: 1 + ( user.inventory.keys[key] || 0 )
                                })
                                Object.assign(gainloot, {
                                    [key]: 1
                                })
                                delete user.dungeons.begin[name].keys[key]

                            }
                        }
                    }

                    //Rareloot
                    let rareLootTypes = Object.keys(rareloot)
                    if ( rareloot["weapons"] ) {
                        let rareLootWeapons = Object.keys(rareloot["weapons"])
                        let loot = {}
                        for ( const type of rareLootTypes ) {
                            Object.assign(loot, {
                                [type]: {}
                            })
                            for ( const weapon of rareLootWeapons ) {
                                const material = Battle.selectRandomThings(rareloot["weapons"][weapon].material)
                                Object.assign(loot.weapons, {
                                    [weapon]: {
                                        material: {}
                                    }
                                })
                                Object.assign(loot["weapons"][weapon].material, {[material]: 1 + ( loot["weapons"][weapon].material[material] || 0 )})
                                let pos = rareloot["weapons"][weapon].material.indexOf(material)
                                rareloot["weapons"][weapon].material.splice(pos, 1)
                                if ( rareloot["weapons"][weapon].material.length === 0 ) {
                                    delete rareloot["weapons"][weapon]
                                    if ( Object.entries(rareloot["weapons"]).length === 0 ) {
                                        delete rareloot["weapons"]
                                    }
                                }
                            }
                            Object.assign(user.inventory.stuff, loot)
                            Object.assign(gainloot, {
                                stuff: loot
                            })
                        }
                    }
                    resolve({users: stringifyUsers, loot: gainloot})

                })

            })
        }

        /**
         * Give orb loot
         * @param {String<dungeonName>} name dungeon name
         * @param {Object<UsersData>} stringifyUsers users data
         * @param {String<id>} id user name
         * @returns {Promise<users>} return users
         */

        static orbLoot(name,stringifyUsers,id) {
            return new Promise((resolve, reject) => {
                let gainloot = {}

                const orbs = stringifyUsers[id].dungeons.begin[name].orb
                let keysObject = Object.keys(orbs)
                for (const orb of keysObject) {
                    if (Battle.randomInt() <= (0.25 * 100)) {
                        if (orbs[orb]) {
                            Object.assign(stringifyUsers[id].inventory.orbs, {
                                [orb]: 1 + (stringifyUsers[id].inventory.orbs[orb] || 0)
                            })
                            Object.assign(gainloot,{
                                [orb]: 1
                            })
                            delete orbs[orb]
                        }else{
                            delete orbs[orb]
                        }
                    }
                }
                resolve({users: stringifyUsers, loot:gainloot})
            })
        }

        /**
         * End dungeons is all loot and rareloot is empty
         * @param {Object<allStringifyUser>}stringifyUser users data
         * @param {String<dungeonName>}name dungeon name
         * @param {String<id>} id user name
         * @returns {Promise<users>} return users
         */

        static EndDungeon(stringifyUser,name,id){
            return new Promise((resolve, reject) => {
                const dungeon = stringifyUser.user[id].dungeons.begin[name]

                const ObjectKey = Object.keys(dungeon)

                /*
                TODO :
                 - ?????????????????????????????????
                 */
                let isEmpty = false
                let entries = []
                for(const key of ObjectKey){
                    entries.push(Object.entries(dungeon[key]).length)
                }

                const filtered = entries.filter(nb => nb !== 0 )
                if(!filtered.length) isEmpty = true

                if(isEmpty){
                    stringifyUser.user[id].dungeons.end[name] = stringifyUser.user[id].dungeons.begin[name]
                    delete stringifyUser.user[id].dungeons.begin[name]
                }
                resolve(stringifyUser)
            })
        }

        /**
         * Make bosses
         * @param monsterList {Array<monster>} monster list
         * @param  {Object<user>} id  user id data
         * @returns {Promise<boss>} return boss stats
         * @constructor
         */

        static MakeBosses(monsterList,id) {
            const Monsters = require('../lib/Monsters')
            const monsters = new Monsters()
            return new Promise((resolve, reject) => {
                if(!Array.isArray(monsterList)){
                    reject({message:"La liste de monstre n'est pas une liste"})
                }

                if(typeof id !== "object" || !id.info){
                    reject({message: "Le id indique n'est pas un utilisateur ou l'utilisateur n'est pas complet"})
                }
                monsters.getMonsterInfo(Battle.selectRandomThings(monsterList), Battle.calcLvl(id)).then((data) => {
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
