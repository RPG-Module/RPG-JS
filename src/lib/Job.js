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

}
module.exports = Jobs
