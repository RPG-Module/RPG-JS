const fs = require('fs/promises')

 class Items {

     /**
      * Get item info
      * @param type {String<itemType>} item type
      * @param name {String<itemName>} item name
      * @returns {Promise<item>} Return item stat
      */
     getItemInfo(name) {
         return new Promise((resolve, reject) => {
             if ( !name ) reject('Specify a item name')
             fs.readFile('./src/assets/JSON/items.json').then(function(obj) {
                 const items = JSON.parse(obj)
                 if ( !items.items[name.toLowerCase()] ) {
                     reject('Cet item n\'existe pas\nItem liste: ' + Object.keys(items.items))
                 }
                 resolve(items.items[name.toLowerCase()])
             }).catch(err => {
                 reject(err)
             })
         })
     }

     /**
      * Get stat material
      * @param {String<materialName>} name material
      * @returns {Promise<material>} Return material stat
      */
     getMaterial(name) {
         return new Promise((resolve, reject) => {
             if ( !name ) reject('Specify a material name')
             fs.readFile('./src/assets/JSON/items.json').then(function(obj) {
                 const objs = JSON.parse(obj)
                 let items = objs.items
                 let materials = {}
                 for ( const item of Object.keys(objs.items) ) {
                     const isMaterial = Object.getOwnPropertyDescriptor(items[item], 'isMaterial')
                     if ( isMaterial.value ) {
                         Object.assign(materials, {
                             [item]: items[item]
                         })
                     }
                 }
                 if ( !materials[name.toLowerCase()] ) {
                     reject('This material doesn\'t exist\nMaterial list: ' + Object.keys(materials) + '\n\n')
                 }
                 resolve(materials[name.toLowerCase()])
             }).catch(err => {
                 reject(err)
             })
         })
     }

     /**
      * Get weapon info
      * @param name {String<materialName>} weapon name
      * @returns {Promise<material>} Return weapon info
      */

     getWeapon(name) {
         return new Promise((resolve, reject) => {
             fs.readFile('./src/assets/JSON/items.json').then(function(obj) {
                 const objs = JSON.parse(obj)
                 if ( !name || !objs.weapons[name] ) reject('Specify a name')

                 let items = objs.items
                 let weapon = {}
                 let materials = {}
                 for ( const item of Object.keys(objs.items) ) {
                     const isMaterial = Object.getOwnPropertyDescriptor(items[item], 'isMaterial')
                     if ( isMaterial.value ) {
                         Object.assign(materials, {
                             [item]: items[item]
                         })
                     }
                 }
                 Object.assign(weapon, objs.weapons[name])
                 Object.assign(weapon, {materials: []})
                 for ( const mat in materials ) {
                     if ( items[mat].weapons instanceof Object ) {
                         weapon.materials.push(materials[mat])
                     }
                 }
                 resolve(weapon)
             }).catch(err => {
                 reject(err)
             })
         })
     }

     //TODO
     // - Crafting
 }
module.exports = Items
