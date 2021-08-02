const fs = require('fs/promises')

class Users{

    constructor() {
        this.utils = require("../compenants/utils")
    }

    /**
     * Create a profile
     * @param name {String<name>} profile name
     * @param race {String<race>} profile race.json
     * @param clan {String<clan>} profile clan
     * @param classe {String<classe>} profile classe
     * @param faction {String<faction>} profile faction
     * @returns {Promise<user>} return new user profile
     */
    createProfile(name,race, classe) {
        return new Promise((resolve, reject) => {
            if ( !name || !race || !classe ) {
                reject("Il manque soit le nom du personnage, soit la race.json, soit le clan, soit la classe")
            }
            fs.readFile('./src/assets/JSON/race.json').then(function(races) {
                const parseRaces = JSON.parse(races)
                if ( !parseRaces[race.toLowerCase()] ) reject('Cette race.json n\'existe pas')
                if ( parseRaces[race.toLowerCase()] ) {
                    fs.readFile('./src/assets/database/users.json').then(function(user) {
                        const parseUserJSON = JSON.parse(user)
                        let ids = Object.keys(parseUserJSON)
                        for ( const id of ids ) {
                            if ( parseUserJSON[id].name.toLowerCase() === name.toLowerCase() ) {
                                reject("Ce nom d'utilisateur est déjà pris")
                            }
                        }
                        const id = Users.generateid()
                        fs.readFile('./src/assets/JSON/perks.json').then(function(perksList) {
                            let defaultPerks = JSON.parse(perksList)
                            //erase default avancement perks to race avancement perks
                            Object.assign(defaultPerks, parseRaces[race.toLowerCase()].info.perks)
                            //assign all avancement perks to new user info
                            Object.assign(parseRaces[race.toLowerCase()].info.perks, defaultPerks)

                            //TODO
                            // - Add Job
                            // - Competence Job
                            const newUser = {
                                [id]: {
                                    name: name.toLowerCase(),
                                    id,
                                    classe,
                                    race,
                                    premium: false,
                                    info: {
                                        level: 1,
                                        xp: 0,
                                        reputation: 0,
                                        point: 0,
                                        stats: parseRaces[race.toLowerCase()].info,
                                    },
                                    job: {},
                                    inventory: {
                                        modifiers: {},
                                        item: {},
                                        keys: {},
                                        orbs: {},
                                        stuff: {
                                            weapons: {},
                                            armors: {},
                                            money: 0
                                        }
                                    },
                                    dungeons: {
                                        begin: {},
                                        end: {}

                                    },
                                    chest: {}

                                }
                            }
                            Users.setJob(newUser[id]).then(() => {
                                const users = Object.assign(parseUserJSON, newUser)
                                fs.writeFile('./src/assets/database/users.json', JSON.stringify(users, null, 2)).then(() => {
                                    resolve({message: "Utilisateur créer", user: newUser})
                                }).catch((err) => {
                                    reject({message: err})
                                })
                            })
                        }).catch((err) => {
                            reject(err)
                        })
                    }).catch((err) => {
                        reject(err)
                    })

                } else {
                    reject({message: "Cette faction n'existe pas"})
                }
            })
        })
    }

    getUserid(name) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                const parseuser = JSON.parse(user)

                let ids = Object.keys(parseuser)

                for(const id of ids){
                    if(parseuser[id].name === name){
                        resolve(id)
                    }
                }
                reject({message:"Aucun utilisateur trouvé"})

            })
        })

    }


    /**
     * Get user profile
     * @param id {Snowflake} user profile id
     * @returns {Promise<profile>} Return profile
     */
    getProfileByID(id) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                if(!id){
                    reject({message:"Aucun id mentionné"})
                }
                const stringifyOlfUserJSON = JSON.parse(user)
                if (!stringifyOlfUserJSON[id]) {
                    reject({message:'Utilisateur non trouvé'})
                }
                resolve({data: stringifyOlfUserJSON[id]})
            }).catch((err)=>{
                reject({message: err})
            })
        })
    }

    getProfileByName(name) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                const parseuser = JSON.parse(user)

                let ids = Object.keys(parseuser)

                let names = []

                for(const id of ids){
                    names.push(parseuser[id].name)
                }
                console.log(names)

                if(!names.includes(name)){
                    reject({message:'Utilisateur non trouvé'})
                }
                for(const id of ids){
                    if(parseuser[id].name === name){
                        resolve(parseuser[id])
                    }
                }

            }).catch((err)=>{
                reject({message: err})
            })
        })
    }

    /**
     * Remove user profile
     * @param profile {Object<profile>} user profile
     * @returns {Promise<string>} Return message
     */
    removeProfile(profile) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                const stringifyOlfUserJSON = JSON.parse(user)
                if(!profile){
                    reject({message:"Aucun utilisateur mentionné"})
                }

                if (!stringifyOlfUserJSON[profile]) {
                    reject('Utilisateur non trouvé')
                }
                delete stringifyOlfUserJSON[profile]
                fs.writeFile('./src/assets/database/users.json', JSON.stringify(stringifyOlfUserJSON, null, 2)).then(() => {
                    resolve({message: "Utilisateur supprimé"})
                }).catch((err) => {
                    reject({message: err})
                })
            }).catch((err) => {
                reject({message: err})
            })
        })
    }

    /**
     * Check user levelup
     * @param profile {Object<profile>} user profile
     * @returns {Promise<profile>} Return user profile
     */
    levelup(profile){
        return new Promise((resolve, reject) => {
            if(!profile){
                reject({message:"Aucun utilisateur mentionné"})
            }
            while (profile.info.xp >= ((profile.info.level+20)*2)){
                profile.info.xp -= ((profile.info.level+20)*2)
                profile.info.level++
                profile.info.point++
            }
            resolve({data:profile})
        })
    }

    /**
     * Open chest
     * @param chest {String<chest>} chest name
     * @param profile {Object<profile>} user profile
     * @returns {Promise<loot>} Return chest loot
     */
    openChest(chest, profile) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (users) {
                const stringifyUsers = JSON.parse(users)
                if(!profile){
                    reject({message:"Aucun utilisateur mentionné"})
                }
                if(!chest){
                    reject({message:"Aucun coffre mentionné"})
                }
                if(stringifyUsers[profile.toLowerCase()].chest[chest]){
                    reject({message :"Cette utilisateur ne possède pas ce coffre"})
                }
                Users.checkKey(chest, stringifyUsers[profile.toLowerCase()]).then((res) =>{
                    if(!res.response){
                        reject({message:res.message})
                    }
                    const loot = {
                        weapons: {},
                        armors: {},
                        money: 0
                    }

                    const toSend = {
                        weapons: {},
                        armors: {},
                        money: 0
                    }
                    Object.assign(loot, stringifyUsers[profile.toLowerCase()].inventory.stuff)
                    fs.readFile('./src/assets/JSON/loottable.json').then(function (lootable) {
                        const stringifyLootable = JSON.parse(lootable)
                        const chests = stringifyLootable.chest
                        const chestList = Object.keys(chests)

                        if(!chestList.includes(chest)){
                            reject("Ce coffre n'existe pas")
                        }else {
                            const selectChest = chests[chest]

                            //Money
                            for (let i = 0; i < selectChest.money.lengthMax; i++) {
                                if (Users.randomInt() <= (selectChest.money.proba * 100)) {
                                    loot.money++
                                    toSend.money++
                                }
                            }

                            //Weapons
                            let weaponsType = Object.keys(selectChest.weapons)
                            for (const weapon of weaponsType) {
                                for (let i = 0; i < selectChest.weapons[weapon].lengthMax; i++) {
                                    if (Users.randomInt() <= (selectChest.weapons[weapon].proba * 100)) {
                                        let selectMat = Users.selectRandomThings(selectChest.weapons[weapon].material)
                                        if(loot.weapons[weapon]){
                                            if(loot.weapons[weapon][selectMat]){
                                                Object.assign(loot.weapons[weapon],{
                                                    [selectMat] : (loot.weapons[weapon][selectMat] ||0) + 1
                                                })
                                            }else{
                                                Object.assign(loot.weapons[weapon],{
                                                    [selectMat] : 1
                                                })
                                            }
                                        }else{
                                            Object.assign(loot.weapons, {
                                                [weapon]: {
                                                    [selectMat] : 1
                                                }
                                            })
                                            Object.assign(toSend.weapons, {
                                                [weapon]: {
                                                    [selectMat] : 1
                                                }
                                            })
                                        }
                                    }
                                }
                            }
                            //Armors
                            let armorsType = Object.keys(selectChest.armor)
                            for (const armor of armorsType) {
                                for (let i = 0; i < selectChest.armor[armor].lengthMax; i++) {
                                    if (Users.randomInt() <= (selectChest.armor[armor].proba * 100)) {
                                        let selectMat = Users.selectRandomThings(selectChest.armor[armor].material)
                                        //oblige de faire comme ca pour l'instant car ¯\_(ツ)_/¯
                                        if(loot.armors[armor]){
                                            if(loot.armors[armor][selectMat]){
                                                Object.assign(loot.armors[armor],{
                                                    [selectMat] : (loot.armors[armor][selectMat] ||0) + 1
                                                })
                                            }else{
                                                Object.assign(loot.armors[armor],{
                                                    [selectMat] : 1
                                                })
                                            }
                                        }else{
                                            Object.assign(loot.armors, {
                                                    [armor]: {
                                                        [selectMat] : 1
                                                    }
                                            })
                                            Object.assign(toSend.armors, {
                                                [armor]: {
                                                    [selectMat] : 1
                                                }
                                            })
                                        }
                                    }
                                }
                            }
                            Object.assign(stringifyUsers[profile.toLowerCase()].inventory.stuff, loot)
                            //Remove chest & Remove key
                            stringifyUsers[profile.toLowerCase()].chest[chest]--
                            if(stringifyUsers[profile.toLowerCase()].chest[chest] === 0 ){
                                delete user.inventory.orbs[orb]
                            }
                            fs.writeFile('./src/assets/database/users.json', JSON.stringify(stringifyUsers, null, 2))
                            resolve({data: toSend})
                        }
                    })
                }).catch((err) =>{
                    reject({message:err})
                })
            })
        })
    }

    /**
     * Use orb for upgrade stats
     * @param orb {String<orb>} orb name
     * @param profile {Object<profile>} user profile
     */
    useOrb(orb,profile){
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (users) {
                const stringifyUsers = JSON.parse(users)
                if(!profile){
                    reject({message:"Aucun utilisateur mentionné"})
                }
                if(!orb){
                    reject({message:"Aucune orbe mentionné"})
                }
                const user = stringifyUsers[profile]
                if(!user.inventory.orbs[orb]){
                    reject({message:"Cette personne ne possède pas cette orbe"})
                }else{
                    user.inventory.orbs[orb]--
                    user.info.stats.stats[orb]++
                    if(user.inventory.orbs[orb] === 0 ){
                        delete user.inventory.orbs[orb]
                    }
                    fs.writeFile('./src/assets/database/users.json', JSON.stringify(stringifyUsers, null, 2))
                }
            })
        })
    }

    //TODO
    // - Harvest
    // - Quest
    // - Job
    // - Reputation
    /**
     * Give all job user
     * @param profile {Object<profile>} user profile
     * @returns {Promise<profile>} Return user
     */
    static setJob(profile) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/jobs.json').then(function (jobs) {
                const stringifyJobs = JSON.parse(jobs)
                const jobsList = Object.keys(stringifyJobs)
                let jobTake = {}
                for (const job of jobsList) {
                    const stats = stringifyJobs[job].stats
                    Object.assign(jobTake, {[job]: {...stats}})

                }
                profile.job =jobTake
                resolve({data:profile})
            })
        })
    }

    /**
     * Update all job if job profile is missing
     * @param profile {String<username>} user name
     */
    updateJob(profile) {
        fs.readFile('./src/assets/JSON/jobs.json').then(function (jobs) {
            fs.readFile('./src/assets/database/users.json').then(function (users) {

                const stringifyJobs = JSON.parse(jobs)
                const stringifyUser = JSON.parse(users)
                let user = stringifyUser[profile.toLowerCase()]
                const jobsList = Object.keys(stringifyJobs)
                let jobTake = {}
                Object.assign(jobTake, user.job)
                for (const job of jobsList) {
                    if(!jobTake[job]){
                        const stats = stringifyJobs[job].stats
                        Object.assign(jobTake, {[job]: {...stats}})
                    }
                }
                user.job = jobTake
                fs.writeFile('./src/assets/database/users.json', JSON.stringify(stringifyUser, null, 2))
            })
        })
    }


    static randomInt(){
        return Math.floor(Math.random()*100)
    }
    static selectRandomThings(array){
        return array[Math.floor(Math.random()*array.length)].toLowerCase();
    }

    /**
     * Check if user content correct key
     * @param chest {String<chest>} chest name
     * @param profile {Object<profile>} user profile
     * @returns {Promise<boolean>} Return if user contain correct key for chest
     */
    static checkKey(chest,profile){
        return new Promise((resolve, reject) => {
            if(!profile){
                reject({message:"Aucun utilisateur mentionné"})
            }
            if(!chest){
                reject({message:"Aucun coffre mentionné"})
            }
            if(chest === 'woodChest' ){
                if(profile.inventory.keys.woodenKey){
                    resolve({response : true})
                }else{
                    resolve({response : false, message:"L'utilisateur ne possède pas de clé pour ce coffre"})
                }
            }
        })
    }

    /**
     * Generate id
     * @returns {String<id>} Return id
     */

    static generateid(){
        const SnowflakeId = require('../compenants/SnwoflakesIDs/main');

        // Initialize snowflake
        const snowflake = new SnowflakeId({
            mid: 42,
            offset: ( 2019 - 1970 ) * 31536000 * 1000,
        });

        return snowflake.generate()
    }
}
module.exports = Users
