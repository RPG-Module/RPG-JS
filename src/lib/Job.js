const fs = require('fs/promises')
const User = require('./Users')
const userManager = new User()
class Jobs {
    //TODO
    // - Job Structure
    // - Gold win
    // - Job level up

    /**
     * Get a job from JSON
     * @param name
     * @returns {Promise<unknown>} return job base stats
     */

    getJob(name) {
        return new Promise((resolve, reject) => {
            if (!name) reject({message: "Nom du metier non specifier"})
            fs.readFile('./src/assets/JSON/jobs.json').then(function (obj) {
                const jobsStringify = JSON.parse(obj)
                if (!jobsStringify[name.toLowerCase()]) {
                    reject('Ce metier n\'existe pas\nItem liste: ' + Object.keys(jobsStringify))
                }
                resolve(jobsStringify[name.toLowerCase()])
            }).catch(err => {
                reject(err)
            })
        })
    }

    /**
     * Harvest ressources for all jobs
     * @param profile {String<username>} user id
     */

    makeJob(profile) {
        return new Promise((resolve,reject) =>{
            fs.readFile('./src/assets/database/users.json').then(function (users) {
                const stringifyUsers = JSON.parse(users)
                const user = stringifyUsers[profile]
                const jobs = user.job
                let gain = {}
                for (const job of Object.keys(jobs)) {
                    let calculmat = Jobs.randomInt(user, job)
                    let calculxp = ((calculmat *0.02)+5*1.75).toFixed(0)
                    if(user.info.stats.energy >= 5){
                        for(const mat of Jobs.JobRessources(job,user)){
                            Object.assign(gain, {
                                [mat]: parseInt(parseInt(calculmat) + (user.inventory.item[mat] || 0))
                            })
                            user.job[job].xp += (parseInt(calculxp))
                            user.info.stats.energy = user.info.stats.energy- ((calculmat *0.02))
                            user.info.xp += parseInt((calculmat/10).toFixed(0))
                            userManager.levelup(user).then(() =>{
                                Object.assign(user.inventory.item, {[mat]: gain[mat]})
                            })
                        }
                    }
                }
                Jobs.levelup(user).then(() => {
                    resolve(gain)
                    fs.writeFile('./src/assets/database/users.json', JSON.stringify(stringifyUsers, null, 2))
                })
            })
        })

    }

    static levelup(profile){
        return new Promise((resolve, reject) => {
            if(!profile){
                reject({message:"Aucun utilisateur mentionné"})
            }
            let xp = 0
            const jobs = Object.keys(profile.job)
            for(const job of jobs){
                while (profile.job[job].xp >= ((profile.job[job].level+20)*3)){
                    profile.job[job].xp -= ((profile.job[job].level+20)*3).toFixed(0)
                    profile.job[job].level++
                    profile.info.xp += 30
                }
            }
            userManager.levelup(profile).then((data) =>{
                resolve({data})

            })
        })
    }

    static randomInt(user,job){
        return (Math.floor(Math.random()*(Math.pow(user.job[job].level, 2)+5)+2*2.5).toFixed(0))
    }
    static JobRessources(job,user){
        switch (job) {
            case "bucheron":
                if (user.job[job].level >= 10) {
                    return ["bois", "hêtre"]
                } else if (user.job[job].level >= 20) {
                    return ["bois", "hêtre", "bouleau"]
                }
                return ["bois"]

            case "mineur":
                 if (user.job[job] <= 10) {
                    return ["pierre", "charbon"]
                } else if (user.job[job].level >= 20) {
                    return ["pierre", "charbon", "fer"]
                }
                return ["pierre"]

            case "chasseur":
                return ["cuir"]
            case "tailleur":
                return ["tissu"]
        }
    }
}
module.exports = Jobs
