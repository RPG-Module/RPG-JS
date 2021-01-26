const RPG = require('./src/Class/RPG')

const rpg = new RPG()


rpg.getMonsterInfo('Slime', 'low').then(r => {
    console.log(r)
})

