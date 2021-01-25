const Ora = require('ora')

module.exports = class {
    constructor() {

    }
    init(){
        const spinners = {
            dbS : new Ora("Connexion à la base de donnée"),
            verification : new Ora("Vérification des variables d'environement").start(),
            discord : new Ora("Connexion à l'api Discord"),
        };
        setTimeout(function () {
            spinners.verification.succeed('Oui')
            spinners.dbS.start()
            setTimeout(function () {
                spinners.dbS.succeed('Oui')
                spinners.discord.start()
ZZ
                setTimeout(function () {
                    spinners.discord.succeed('Oui')

                },2500)
            },2500)
        },2500)
    }
}
