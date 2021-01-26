const RPG = require('./src/Class/RPG')

const rpg = new RPG()

rpg.getMonsterInfo('Slime', 'medium').then(r => {
})

rpg.getItemInfo("heal","Heal potion").then(r =>{
})
