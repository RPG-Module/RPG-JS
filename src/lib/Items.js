const fs = require('fs/promises')
module.exports = class {

    constructor() {
    }

    getItemInfo(type,name) {

        return new Promise((resolve, reject) => {
            if(!name) reject('Specify a item name')
            if(!type) reject('Specify a type name')
            name = name.replace(/^\w/, c => c.toUpperCase());

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

        return new Promise((resolve, reject) => {
            if(!name) reject('Specify a material name')
            name = name.replace(/^\w/, c => c.toUpperCase());

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
            if(!name) reject('Specify a material name')
            name = name.replace(/^\w/, c => c.toUpperCase());
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
