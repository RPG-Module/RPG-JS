let usernames = []

class AuthService{
    connect(username){
        AuthService.setUsernames(username)
        console.log(AuthService.getUsernames())
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
