const fs = require('fs/promises')

 class Items{
    getItemInfo(type,name) {
        return new Promise((resolve, reject) => {
            if(!name) reject('Specify a item name')
            if(!type) reject('Specify a type name')
            fs.readFile('./src/assets/JSON/object.json').then(function (obj) {
                const objs = JSON.parse(obj)
                if(!objs[type.toLowerCase()]){
                    reject('Ce type n\'existe pas\nType liste: '+ Object.keys(objs))
                }
                if(!objs[type.toLowerCase()][name.toLowerCase()]){
                    reject('Cet item n\'existe pas\nItem liste: '+ Object.keys(objs[type.toLowerCase()]))
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
    //TODO
    // - Crafting
}
module.exports = Items
