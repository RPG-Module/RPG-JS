const fs = require('fs/promises')
module.exports = class {

    constructor() {
    }

    getItemInfo(type,name) {

        return new Promise((resolve, reject) => {
            if(!name) reject('Specify a item name')
            if(!type) reject('Specify a type name')

            fs.readFile('./src/assets/JSON/object.json').then(function (obj) {
                const objs = JSON.parse(obj)
                if(!objs[type.toLowerCase()]){
                    reject('This type doesn\'t exist\nType list: '+ Object.keys(objs))
                }
                if(!objs[type.toLowerCase()][name.toLowerCase()]){
                    reject('This item doesn\'t exist\nItem list: '+ Object.keys(objs[type.toLowerCase()]))
                }
                resolve(objs[type.toLowerCase()][name.toLowerCase()])
            }).catch(err =>{
                reject(err)
            })
        })
    }

    getMaterialArmor(name){

        return new Promise((resolve, reject) => {
            if(!name) reject('Specify a material name')
            fs.readFile('./src/assets/JSON/armor.json').then(function (obj) {
                const objs = JSON.parse(obj)
                if(!objs.material[name.toLowerCase()]){
                    reject('This material doesn\'t exist\nMaterial list: '+ Object.keys(objs.material))
                }
                resolve(objs.material[name.toLowerCase()])
            }).catch(err =>{
                reject(err)
            })
        })
    }
    getMaterialWeapon(name){
        return new Promise((resolve, reject) => {
            if(!name) reject('Specify a material name')

            fs.readFile('./src/assets/JSON/weapon.json').then(function (obj) {
                const objs = JSON.parse(obj)
                if(!objs.material[name.toLowerCase()]){
                    reject('This material doesn\'t exist\nMaterial list: '+ Object.keys(objs.material))
                }
                resolve(objs.material[name.toLowerCase()])
            }).catch(err =>{
                reject(err)
            })
        })
    }
}
