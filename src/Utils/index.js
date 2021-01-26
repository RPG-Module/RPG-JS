const Users = require('./User')
const Battle = require('./Battle')

class Utils {
    constructor() {
        this.users = new Users()
        this.battle = new Battle()

    }
}

module.exports = Utils
