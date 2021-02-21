const fs = require('fs/promises')

class Users{

    createProfile(name,race, clan, classe,faction) {

        return new Promise((resolve, reject) => {
            if(!name || !race || !clan || !classe || !faction) {
                reject("Il manque soit le nom du personnage, soit la race, soit le clan, soit la classe")
            }

            fs.readFile('./src/assets/JSON/race.json').then(function (races) {
                const stringifyRaces = JSON.parse(races)

                fs.readFile('./src/assets/JSON/clan.json').then(function (clans) {
                    const stringifyClans = JSON.parse(clans)
                    if(!stringifyRaces[race.toLowerCase()]) reject('Cette race n\'existe pas')
                    if(stringifyClans[faction.toLowerCase()]){
                        if(stringifyClans[faction.toLowerCase()][race.toLowerCase()]){
                            if(stringifyClans[faction.toLowerCase()][race.toLowerCase()][clan.toLowerCase()]){
                                fs.readFile('./src/assets/database/users.json').then(function (user) {
                                    const stringifyOlfUserJSON = JSON.parse(user)
                                    if(stringifyOlfUserJSON[name.toLowerCase()]){
                                        reject("Ce nom d'utilisateur est déjà pris")
                                    }
                                    const newUser = {
                                        [name.toLowerCase()]:{
                                            classe,
                                            race,
                                            clan,
                                            faction,
                                            premium: false,
                                            info:{
                                                level:1,
                                                xp:0,
                                                stats: stringifyClans[faction.toLowerCase()][race.toLowerCase()][clan.toLowerCase()].info,
                                                point:0
                                            },
                                            inventory: {
                                                modifiers:{},
                                                item:{},
                                                keys:{},
                                                orbs:{},
                                                stuff:{}
                                            },
                                            dungeons: {
                                                begin:{},
                                                end:{}

                                            },
                                            chest: {}

                                        }
                                    }
                                    const users = Object.assign(stringifyOlfUserJSON,newUser)
                                    fs.writeFile('./src/assets/database/users.json',JSON.stringify(users, null, 2)).then(()=>{
                                        resolve({message:"Utilisateur créer",user:newUser})
                                    }).catch((err)=>{
                                        reject(err)
                                    })
                                }).catch((err)=>{
                                    reject(err)
                                })
                            }else{
                                reject("Ce clan n'existe pas dans cette race" )
                            }
                        }else{
                            reject("Cette race n'existe pas dans cette faction")
                        }
                    }else{
                        reject("Cette faction n'existe pas")
                    }


                })
            })


        })

    }

    getProfile(profile) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                const stringifyOlfUserJSON = JSON.parse(user)
                if (!stringifyOlfUserJSON[profile]) {
                    reject('Utilisateur non trouvé')
                }
                resolve(stringifyOlfUserJSON[profile])
            }).catch((err)=>{
                reject(err)
            })
        })

    }

    removeProfile(profile) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                const stringifyOlfUserJSON = JSON.parse(user)
                if (!stringifyOlfUserJSON[profile]) {
                    reject('Utilisateur non trouvé')
                }
                delete stringifyOlfUserJSON[profile]
                fs.writeFile('./src/assets/database/users.json', JSON.stringify(stringifyOlfUserJSON, null, 2)).then(() => {
                    resolve({message: "Utilisateur supprimé"})
                }).catch((err) => {
                    reject(err)
                })
            }).catch((err) => {
                reject(err)
            })
        })
    }
    levelup(profile){

        return new Promise((resolve, reject) => {
            let needXP = ((profile.info.level+15)*2)
            while (profile.info.xp >= needXP){
                profile.info.xp -= profile.info.level+10
                profile.info.level++
                profile.info.point++
            }
            resolve(profile)
        })
    }
    //TODO make chest opening
    openChest(chest, profile) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (users) {
                const stringifyUsers = JSON.parse(users)
                let user = stringifyUsers[profile.toLowerCase()]
                const chestList = Object.keys(user.chest)
                const loot = {}
                if (!chestList.includes(chest)) {
                    reject('Coffre non trouvé ou le joueur ne possède pas ce coffre')
                }
                fs.readFile('./src/assets/JSON/loottable.json').then(function (lootTable) {
                    const stringifyLootTable = JSON.parse(lootTable)

                    if (!stringifyLootTable.chest[chest]) {
                        reject("Ce coffre ne possède pas de lootTable")
                    }
                    const selectedChest = stringifyLootTable.chest[chest]
                    const lootTypes = Object.keys(selectedChest)
                    for (const lootType of lootTypes) {
                        if (lootType === 'money') {
                            for (let i = 0; i < selectedChest['money'].lengthMax; i++) {
                                if (Users.randomInt() <= (selectedChest['money'].proba * 100)) {
                                    Object.assign(loot, {money: 1 + (loot.money || 0)})

                                }
                            }
                        } else {
                            if(lootType === 'weapons'){
                                const weapons = Object.keys(selectedChest[lootType])
                                for(const weapon of weapons){
                                    for(const material of selectedChest[lootType][weapon].material){
                                        console.log(selectedChest[lootType][weapon])
                                        if (Users.randomInt() <= (selectedChest[lootType][weapon].proba * 100)) {
                                            Object.assign(loot,{["weapons"]: {
                                                [weapon]:{
                                                    material:{
                                                        [material]: 1+(
                                                            stringifyUsers[profile.toLowerCase()].inventory.stuff.weapons[weapon]?.material?[material] : 0)
                                                    }
                                                }
                                            }})
                                            console.log(loot.weapons[weapon].material)
                                        }
                                    }
                                }
                            }

                            /*if (Users.randomInt() <= (selectedChest[lootType].proba * 100)) {
                                Object.assign(loot, {[lootType]: 1 + (loot.money || 0)})

                            }*/
                        }
                    }

                })

            })
        })
    }
    static randomInt(){
        return Math.floor(Math.random()*100)
    }
}
module.exports = Users
