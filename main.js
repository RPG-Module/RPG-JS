const RPG = require('./src/Class/RPG')

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


rpg.users.createProfile('Lynhall',"Elf","Meridor","Classe","Tadil").then((data)=>{

    rpg.battles.fightDungeon('Crypte des esprits',"Lynhall").then((data) =>{
        console.log(data)
    })

})



