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
                                        [name]:{
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
    static levelup(profile){
        console.log(profile.info.xp)

        return new Promise((resolve, reject) => {
            let needXP = ((profile.info.level+5)*2)
            while (profile.info.xp >= needXP){
                profile.info.xp -= profile.info.level+10
                profile.info.level++
                profile.info.point++
            }
            resolve(profile)
        })
    }

}
module.exports = Users
