const RPG = require('./src/Class/RPG')

const rpg = new RPG()

rpg.monsters.getMonsterInfo('Slime').then(r =>{
    console.log(r)
}).catch((err)=>{
    console.log(err)
})


rpg.items.getItemInfo("heal","Heal potion").then(r =>{
    console.log(r)
}).catch((err)=>{
    console.log(err)
})


rpg.items.getMaterialArmor("Iron").then((r) =>{

}).catch((err)=>{
    console.log(err)
})
