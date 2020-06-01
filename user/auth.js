const { Account } = require('./models/schema')

const bcrypt = require('bcrypt')

module.exports = {
    //retorna Promise que ao ser resolvida indica se o usuario passou a combinacao certa de email/password (true/false)
    checkLogin: async (email, pass) => {
        const selectedArr = await Account.query().select().where('email', '=', email)
        if (selectedArr.length > 0) {
            const account = selectedArr[0]
            const loginResult = await bcrypt.compare(pass, account.password)
            return {
                loginResult: loginResult,
                accessLevel: account.accessLevel
            }
        }
        else {
            return {
                loginResult: false
            }
        }
    }



}