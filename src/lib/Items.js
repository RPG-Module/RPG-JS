const fs = require('fs/promises')
module.exports = class {

    constructor() {
    }

    getItemInfo(type,name) {
        name = name.replace(/^\w/, c => c.toUpperCase());

        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/object.json').then(function (obj) {
                const objs = JSON.parse(obj)
                if(!objs[type]){
                    reject('This type doesn\'t exist\nType list: '+ Object.keys(objs))
                }
                if(!objs[type][name]){
                    reject('This item doesn\'t exist\nItem list: '+ Object.keys(objs[type]))
                }
                resolve(objs[type][name])
            }).catch(err =>{
                reject(err)
            })
        })
    }

    getMaterialArmor(name){
        name = name.replace(/^\w/, c => c.toUpperCase());

        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/armor.json').then(function (obj) {
                const objs = JSON.parse(obj)
                if(!objs.material[name]){
                    reject('This material doesn\'t exist\nMaterial list: '+ Object.keys(objs.material))
                }
                resolve(objs.material[name])
            }).catch(err =>{
                reject(err)
            })
        })
    }
    getMaterialWeapon(name){
        return new Promise((resolve, reject) => {
            fs.readFile('./src/assets/JSON/weapon.json').then(function (obj) {
                const objs = JSON.parse(obj)
                if(!objs.material[name]){
                    reject('This material doesn\'t exist\nMaterial list: '+ Object.keys(objs.material))
                }
                resolve(objs.material[name])
            }).catch(err =>{
                reject(err)
            })
        })
    }
}
