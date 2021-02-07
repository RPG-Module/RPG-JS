const fs = require('fs/promises')

module.exports = class {
    constructor() {


    }

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
                                        [name]:{
                                            classe,
                                            race,
                                            clan,
                                            faction,
                                            premium: false,
                                            info:{
                                                level:1,
                                                xp:0,
                                                stats: stringifyClans[faction.toLowerCase()][race.toLowerCase()][clan.toLowerCase()].info
                                            },
                                            inventory: {
                                                modifiers:{},
                                                item:{},
                                                keys:{}
                                            },
                                            dungeons: {
                                                begin:{},
                                                end:{}

                                            },
                                            chest: {}

                                        }
                                    }
                                    const users = Object.assign(stringifyOlfUserJSON,newUser)
                                    fs.writeFile('./src/assets/database/users.json',JSON.stringify(users, null, 4)).then(()=>{
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

    getProfile(name) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                const stringifyOlfUserJSON = JSON.parse(user)
                if (!stringifyOlfUserJSON[name]) {
                    reject('Utilisateur non trouvé')
                }
                resolve(stringifyOlfUserJSON[name])
            }).catch((err)=>{
                reject(err)
            })
        })

    }

    removeProfile(name) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                const stringifyOlfUserJSON = JSON.parse(user)
                if (!stringifyOlfUserJSON[name]) {
                    reject('Utilisateur non trouvé')
                }
                delete stringifyOlfUserJSON[name]
                fs.writeFile('./src/assets/database/users.json', JSON.stringify(stringifyOlfUserJSON, null, 4)).then(() => {
                    resolve({message: "Utilisateur supprimé"})
                }).catch((err) => {
                    reject(err)
                })
            }).catch((err) => {
                reject(err)
            })
        })
    }
}
