

const fs = require('fs/promises')

class Users{

    /**
     * Create a profile
     * @param name {String<name>} profile name
     * @param race {String<race>} profile race
     * @param clan {String<clan>} profile clan
     * @param classe {String<classe>} profile classe
     * @param faction {String<faction>} profile faction
     * @returns {Promise<user>} return new user profile
     */
    createProfile(name,race, clan, classe,faction) {
        return new Promise((resolve, reject) => {
            if (!name || !race || !clan || !classe || !faction) {
                reject("Il manque soit le nom du personnage, soit la race, soit le clan, soit la classe")
            }
            fs.readFile('./src/assets/JSON/race.json').then(function (races) {
                const parseRaces = JSON.parse(races)
                fs.readFile('./src/assets/JSON/clan.json').then(function (clans) {
                    const parseClans = JSON.parse(clans)
                    if (!parseRaces[race.toLowerCase()]) reject({message:'Cette race n\'existe pas'})
                    if (parseClans[faction.toLowerCase()]) {
                        if (parseClans[faction.toLowerCase()][race.toLowerCase()]) {
                            if (parseClans[faction.toLowerCase()][race.toLowerCase()][clan.toLowerCase()]) {
                                fs.readFile('./src/assets/database/users.json').then(function (user) {
                                    const parseUserJSON = JSON.parse(user)
                                    let uuids = Object.keys(parseUserJSON)
                                    for(const uuid of uuids){
                                        if (parseUserJSON[uuid].name.toLowerCase() === name.toLowerCase()) {
                                            reject({message:"Ce nom d'utilisateur est déjà pris"})
                                        }
                                    }

                            const uuid = Users.generateUUID()
                                    //TODO
                                    // - Add Job
                                    // - Competence Job
                                    const newUser = {
                                        [uuid]: {
                                            name: name.toLowerCase(),
                                            classe,
                                            race,
                                            clan,
                                            faction,
                                            premium: false,
                                            info: {
                                                level: 1,
                                                xp: 0,
                                                reputation: 0,
                                                point:0,
                                                stats: parseRaces[faction.toLowerCase()][race.toLowerCase()][clan.toLowerCase()].info,
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
                                    Users.setJob(newUser[uuid]).then(() => {
                                        const users = Object.assign(parseUserJSON, newUser)
                                        fs.writeFile('./src/assets/database/users.json', JSON.stringify(users, null, 2)).then(() => {
                                            resolve({message: "Utilisateur créer", user: newUser})
                                        }).catch((err) => {
                                            reject({message:err})
                                        })
                                    })

                                }).catch((err) => {
                                    reject(err)
                                })
                            } else {
                                reject({message:"Ce clan n'existe pas dans cette race"})
                            }
                        } else {
                            reject({message:"Cette race n'existe pas dans cette faction"})
                        }
                    } else {
                        reject({message:"Cette faction n'existe pas"})
                    }
                })
            })
        })
    }

    getUserUUID(name) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                const parseuser = JSON.parse(user)

                let uuids = Object.keys(parseuser)

                for(const uuid of uuids){
                    if(parseuser[uuid].name === name){
                        resolve(uuid)
                    }
                }
                reject({message:"Aucun utilisateur trouvé"})

            })
        })

    }


    /**
     * Get user profile
     * @param profile {Object<profile>} user profile
     * @returns {Promise<profile>} Return profile
     */
    getProfile(profile) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                if(!profile){
                    reject({message:"Aucun utilisateur mentionné"})
                }
                const stringifyOlfUserJSON = JSON.parse(user)
                if (!stringifyOlfUserJSON[profile]) {
                    reject({message:'Utilisateur non trouvé'})
                }
                resolve({data: stringifyOlfUserJSON[profile]})
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
     * @returns {Promise<unknown>} nothing.
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
     * Generate UUID
     * @returns {String<uuid>} Return UUID
     */

    static generateUUID(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
module.exports = Users
