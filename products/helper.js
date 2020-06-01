var jwt = require('jsonwebtoken')
const { send } = require('micro')
const privateKey = 'my private key 123'

// userFromToken, isAdmin, privateKey
module.exports = {
  // retorna objeto contendo { email: ,rg:, accessLevel: } do usuario correspondente ao token passado
  userFromToken: (res, token) => {
    const decoded = jwt.verify(token, privateKey)
    return decoded
  },

  // recebe objeto user e verifica se 'e admin
  isAdmin: user => {
    if (user.accessLevel != 'admin') {
      return false
    }
    return true
  }
}
