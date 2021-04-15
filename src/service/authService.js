let usernames = []
const fs = require('fs/promises')

class AuthService{
    connect(username){
        AuthService.setUsernames(username)
        
        fs.readFile('./src/assets/database/users.json').then((data) =>{
            const parseData = JSON.parse(data)
            console.log(Object.keys(parseData))

            for(const user of Object.keys(parseData)){
                console.log()
                if(parseData[user].name === username.toLowerCase){
                    
                }
            }
        })

    }

    disconnect(username){
        console.log(usernames)
        usernames.remove(username)
        console.log(usernames)
    }

    static getUsernames(){
        return this.username
    }

    static setUsernames(username){
        if(!usernames.includes(username)){
            usernames.push(username)
        }
    }
}

module.exports = AuthService
