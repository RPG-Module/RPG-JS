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

}).catch((err)=>{
    console.log(err)
})*/
rpg.users.createProfile('Test',"Elf","Meridor","Classe","Tadil").then(()=> {
        rpg.battles.startDungeon('Crypte des esprits','Test').then(()=> {
                rpg.battles.fightDungeon('Crypte des esprits','Test').then((data)=>{
                fs.readFile('./src/assets/database/users.json').then(function (user) {
                        console.log(JSON.parse(user))
                })
        })
        })
})

