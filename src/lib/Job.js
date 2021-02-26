const fs = require('fs/promises')
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
                if (!objs[name.toLowerCase()]) {
                    reject('Ce metier n\'existe pas\nItem liste: ' + Object.keys(jobsStringify))
                }
                resolve(jobsStringify[name.toLowerCase()])
            }).catch(err => {
                reject(err)
            })
        })
    }

    //TODO
    // - Make gain ressources

    //FIXME
    // - Made a "}" if no mat gain

    /**
     * Harvest ressources for all jobs
     * @param profile
     */
    makeJob(profile) {
        fs.readFile('./src/assets/database/users.json').then(function (users) {
            const stringifyUsers = JSON.parse(users)
            const user = stringifyUsers[profile.toLowerCase()]
            const jobs = user.job
            for(const job of Object.keys(jobs)){

                let calculmat = Jobs.randomInt(user,job)
                let calculxp = (calculmat*1.25).toFixed(0)
                let calculNeedXp = Math.pow(user.job[job].level, 2)+Math.pow(2, 1.5).toFixed(0)
                let gain = {}

                Object.assign(gain,{
                    [Jobs.JobRessources(job)]: parseInt(calculmat) + (user.inventory.item[Jobs.JobRessources(job)] || 0)
                })
                console.log(gain)
                user.job[job].xp+calculxp
                Object.assign(user.inventory.item, {[Jobs.JobRessources(job)]: gain[Jobs.JobRessources(job)]})

                fs.writeFile('./src/assets/database/users.json', JSON.stringify(stringifyUsers, null, 2))

            }

        })
    }

    /**
     * Update all job if job profile is missing
     * @param profile
     */
    updateJob(profile){

    }
    static randomInt(user,job){
        return (Math.floor(Math.random()*(Math.pow(user.job[job].level, 2)+5)+2).toFixed(0))
    }
    static JobRessources(job){
        switch (job){
            case "bucheron":
                return "bois"
            case "mineur":
                return "pierre"
            case "chasseur":
                return "cuir"
        }
    }
}
module.exports = Jobs
