const fs = require('fs/promises')
const Monsters = require('../lib/Monsters')
const Users = require('../lib/Users')
const Items = require('../lib/Items')
module.exports = class {
    constructor() {
        this.monsters = new Monsters()
        this.users =  new Users()
        this.items = new Items()

    }

    startDungeon(name,profile) {
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/dungeons.json').then(function (dungeons) {
                fs.readFile('./src/assets/database/users.json').then(function (users) {
                    const stringifyUsers = JSON.parse(users)
                    const stringifyDungeons = JSON.parse(dungeons)
                    if (!stringifyUsers[profile]) {
                        reject("Cette utilisateur n'existe pas")
                    }
                    if (!stringifyDungeons[name]) {
                        reject("Ce donjon n'existe pas")
                    }
                    let user = stringifyUsers[profile]
                    Object.assign(user.dungeons.begin, {[name]: stringifyDungeons[name].loot})
                    console.log(user)
                    fs.writeFile('./src/assets/database/users.json',JSON.stringify(user, null, 4)).then(()=>{
                        resolve({message:"Nouveau donjon commencé"})
                    }).catch((err)=>{
                        reject(err)
                    })
                })
            })
        })
    }

    fightDungeon(name,profile){
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/dungeons.json').then(function (dungeons) {
                fs.readFile('./src/assets/database/users.json').then(function (users) {
                    const stringifyUsers = JSON.parse(users)
                    const stringifyDungeons = JSON.parse(dungeons)
                    if (!stringifyUsers[profile]) {
                        reject("Cette utilisateur n'existe pas")
                    }
                    if (!stringifyDungeons[name]) {
                        reject("Ce donjon n'existe pas")
                    }
                    let user = stringifyUsers[profile]
                    let dungeon = stringifyDungeons[name]

                    console.log(this.monsters.getMonsterInfo(dungeon.monster))

                    /*Object.assign(user.dungeons.begin, {[name]: dungeon.loot})
                    fs.writeFile('./src/assets/database/users.json',JSON.stringify(user, null, 4)).then(()=>{
                        resolve({message:"Nouveau donjon commencé"})
                    }).catch((err)=>{
                        reject(err)
                    })*/
                })
            })
        })
    }
}
