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
        rpg.battles.startDungeon('Crypte des esprits','Test').then(()=>{
                rpg.battles.fightDungeon('Crypte des esprits','Test').then((data)=>{
                        console.log(data)
                })
        })

