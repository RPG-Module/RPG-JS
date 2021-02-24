const fs = require('fs/promises')
class Jobs {
    //TODO Job Structure, gold win, Job level up

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
    makeJob(profile) {
        fs.readFile('./src/assets/database/users.json').then(function (users) {
            const stringifyUsers = JSON.parse(users)
            let  test = {lvl:1}
            const user = stringifyUsers[profile.toLowerCase()]
            const jobs = user.job
            for(const job of Object.keys(jobs)){

                let calculmat = Jobs.randomInt(user,job)
                let calculxp = (calculmat*1.25).toFixed(0)
                let calculNeedXp = Math.pow(user.job[job].level, 2)+Math.pow(2, 1.5).toFixed(0)
                let gain = {}

                console.log(calculmat)
                console.log(calculxp)
                console.log(calculNeedXp)
                Object.assign(gain,{
                    [job]: calculmat + (user.inventory.item[job] || 0)
                })
                user.job[job].xp+calculxp
                Object.assign(user.inventory.item, {[job]: gain[job]})

                test.lvl++
            }

        })
    }
    updateJob(profile){

    }
    static randomInt(user,job){
        console.log()
        return (Math.floor(Math.random()*(Math.pow(user.job[job].level, 2)+5)+2).toFixed(0))
    }
}
module.exports = Jobs
