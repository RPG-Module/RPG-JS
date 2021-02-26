

const fs = require('fs/promises')

class Users{

    /**
     * Create a profile
     * @param name
     * @param race
     * @param clan
     * @param classe
     * @param faction
     * @returns {Promise<unknown>} return new user profile
     */
    createProfile(name,race, clan, classe,faction) {
        return new Promise((resolve, reject) => {
            if (!name || !race || !clan || !classe || !faction) {
                reject("Il manque soit le nom du personnage, soit la race, soit le clan, soit la classe")
            }
            fs.readFile('./src/assets/JSON/race.json').then(function (races) {
                const stringifyRaces = JSON.parse(races)
                fs.readFile('./src/assets/JSON/clan.json').then(function (clans) {
                    const stringifyClans = JSON.parse(clans)
                    if (!stringifyRaces[race.toLowerCase()]) reject({message:'Cette race n\'existe pas'})
                    if (stringifyClans[faction.toLowerCase()]) {
                        if (stringifyClans[faction.toLowerCase()][race.toLowerCase()]) {
                            if (stringifyClans[faction.toLowerCase()][race.toLowerCase()][clan.toLowerCase()]) {
                                fs.readFile('./src/assets/database/users.json').then(function (user) {
                                    const stringifyOlfUserJSON = JSON.parse(user)
                                    if (stringifyOlfUserJSON[name.toLowerCase()]) {
                                        reject({message:"Ce nom d'utilisateur est déjà pris"})
                                    }
                                    //TODO
                                    // - Add Job
                                    // - Competence Job
                                    const newUser = {
                                        [name.toLowerCase()]: {
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
                                                stats: stringifyClans[faction.toLowerCase()][race.toLowerCase()][clan.toLowerCase()].info,
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
                                    Users.setJob(newUser[name.toLowerCase()]).then(() => {
                                        const users = Object.assign(stringifyOlfUserJSON, newUser)
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

    /**
     * Get user profile
     * @param profile
     * @returns {Promise<unknown>} Return profile
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
                resolve(stringifyOlfUserJSON[profile])
            }).catch((err)=>{
                reject({message: err})
            })
        })
    }

    /**
     * Remove user profile
     * @param profile
     * @returns {Promise<unknown>} Return message
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

    //FIXME levelup rework
    /**
     * Check user levelup
     * @param profile
     * @returns {Promise<unknown>} Return user profile
     */
    levelup(profile){
        return new Promise((resolve, reject) => {
            if(!profile){
                reject({message:"Aucun utilisateur mentionné"})
            }
            let needXP = ((profile.info.level+15)*2)
            while (profile.info.xp >= needXP){
                profile.info.xp -= profile.info.level+10
                profile.info.level++
                profile.info.point++
            }
            resolve({data:profile})
        })
    }

    /**
     * Open chest
     * @param chest
     * @param profile
     * @returns {Promise<unknown>} Return chest loot
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
     * @param orb
     * @param profile
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
     * @param user
     * @returns {Promise<unknown>} Return user
     */
    static setJob(user) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/jobs.json').then(function (jobs) {
                const stringifyJobs = JSON.parse(jobs)

                const jobsList = Object.keys(stringifyJobs)
                let jobTake = {}
                for (const job of jobsList) {
                    const stats = stringifyJobs[job].stats
                    Object.assign(jobTake, {[job]: {...stats}})

                }
                user.job =jobTake

                resolve({data:user})

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
     * @param chest
     * @param profile
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
}
module.exports = Users
