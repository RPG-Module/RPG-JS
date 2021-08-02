const fs = require('fs/promises')

const convert = require('xml-js');
const SnowflakeId = require('./SnwoflakesIDs/main');

// Initialize snowflake
const snowflake = new SnowflakeId({
    mid: 42,
    offset: ( 2019 - 1970 ) * 31536000 * 1000,
});

module.exports = {
    readXML(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(`./src/conf/${file}.xml`).then(function (data) {
                const json = JSON.parse(convert.xml2json(data, {compact: true, spaces: 2}))
                resolve(json);
            }).catch((err) =>{
                reject({error: err , message:"Impossible de lire le fichier XML"})
            })
        })

    },

    generateIds(){
        return snowflake.generate()
    }
}
