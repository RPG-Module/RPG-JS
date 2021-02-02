const fs = require('fs/promises')

module.exports = class {
    constructor() {
    }

    createprofile(name,race, clan, classe) {

        return new Promise((resolve, reject) => {
            if(!name || !race || !clan || !classe) {
                reject("Il manque soit le nom du personnage, soit la race, soit le clan, soit la classe")
            }
                const newUser = {
                    [name]:{
                        classe,
                        race,
                        clan,
                        premium: false,
                        inventory: {},
                        dungeons: {},
                        chest: {}

                    }
                }
            fs.readFile('./src/assets/database/users.json').then(function (user) {
                const stringifyOlfUserJSON = JSON.parse(user)
                if(stringifyOlfUserJSON[name]){
                    reject("Ce nom d'utilisateur est déjà pris")
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
}
