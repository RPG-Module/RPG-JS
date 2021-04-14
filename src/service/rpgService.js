const Monsters = require('../lib/Monsters')
const Battles = require('../lib/Battles')
const Users = require('../lib/Users')
const Items = require('../lib/Items')
const Jobs = require('../lib/Job')

class Rpg {
    constructor() {
        this.monsters = new Monsters()
        this.users =  new Users()
        this.items = new Items()
        this.battles = new Battles()
        this.jobs = new Jobs()
    }
}

module.exports = Rpg
