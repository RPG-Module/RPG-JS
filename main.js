const RPG = require('./src/Class/RPG')
const fs = require('fs/promises')

const rpg = new RPG()

/*rpg.monsters.getMonsterInfo('Slime','low').then(r =>{
    console.log(r)
}).catch((err)=>{
    console.log(err)
})


rpg.items.getItemInfo("heal","heal potion").then(r =>{
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
    rpg.battles.startDungeon('Crypte des esprits', 'Hallo').then((r) => {
        //rpg.battles.fightDungeon('Crypte des esprits', 'Hallo').then((r) => {
        }).catch((err)=>{
            console.log(err)
        })
    /*}).catch((err)=>{
        console.log(err)
    })
}).catch((err)=>{
    console.error(err)
})*/




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



