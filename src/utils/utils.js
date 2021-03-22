const fs = require('fs/promises')

const convert = require('xml-js');


const utls = {
    readXML(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(`./src/conf/${file}.xml`).then(function (data) {
                const json = JSON.parse(convert.xml2json(data, {compact: true, spaces: 2}))
                resolve(json);
            }).catch((err) =>{
                reject({error: err , message:"Impossible de lire le fichier XML"})
            })
        })

    }
}


module.exports = utls
