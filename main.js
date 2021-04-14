const {RpgService,AuthService} = require('./src/Class/RPG')
const fs = require('fs/promises')
const user = "802e51ac-f377-4779-b35a-c1b9c0940c7b"
const rpg = new RpgService()
const auth = new AuthService()

auth.connect('afdsq')
auth.disconnect('afdsq')



/*rpg.items.getItemInfo("heal","heal potion").then(r =>{
    console.log(r)
}).catch((err)=>{
    console.log(err)
})


rpg.items.getMaterialArmor("Iron").then((r) =>{
    console.log(r)
}).catch((err)=>{
    console.log(err)
})

rpg.items.getMaterialWeapon("Iron").then((r) =>{
    console.log(r)
}).catch((err)=>{
    console.log(err)
})*/
//rpg.users.createProfile("Hallo","Elf","Meridor","Classe","Tadil").then((data) =>{
   // rpg.battles.startDungeon('Crypte des esprits', 'Hallo').then((r) => {
        //rpg.battles.fightDungeon('Crypte des esprits', 'Hallo').then((r) => {
        //}).catch((err)=>{
            //console.log(err)
        //})
    /*}).catch((err)=>{
        console.log(err)
    })*/
//}).catch((err)=>{
    //console.error(err)
//})
//const utils = require('./src/utils/utils')


//rpg.users.updateJob("Hallo")
/*rpg.users.createProfile("Hallo","Elf","Meridor","Classe","Tadil").then((data) =>{
    console.log(data)
}).catch((err)=>{
    console.error(err)
})*/


/*rpg.users.getProfile('Test').then((r) => {
        console.log(r)
}).catch((err)=>{
        console.log(err)
})

rpg.users.removeProfile('Test').then((r) => {
        console.log(r)
}).catch((err)=>{
        console.log(err)
})*/

/*
rpg.monsters.getMonsterInfo("slime","low").then((monster) =>{
    console.log(monster.loot["Drop of slime"].data)
})
*/

