const { User } = require('./models/schema')
const { json, send } = require('micro')
const { userFromToken, isAdmin } = require('./helper')

module.exports = {
  createUser: async (req, res) => {
    try {
      let userData = await json(req)

      if (('rg' in userData) && ('name' in userData)) {
        await User.query().insert(userData)
        send(res, 200, 'User Created!')
      }
      else {
        send(res, 400, 'Bad Parameters - rg and name required')
      }
    }
    catch (err) { send(res, 500, JSON.stringify(err)) }
  },

  //responde com os dados do usuário que possui o rg passado como querystring
  getUser: async (req, res) => {
    try {
      const token = req.headers.authorization
      const account = userFromToken(res, token)

      const rg = req.params.rg
      const query = req.query //query generica

      var selectedArr = []

      //O admin pode visualizar todos os users
      if (isAdmin(account) && rg != undefined) {
        selectedArr = await User.query().select().where({ rg: rg })
      }
      else if (isAdmin(account) && rg == undefined) {
        selectedArr = await User.query().select().where(query)
      }
      else if (!isAdmin(account)) {
        //adicionando/substituindo o rg da query generica para pesquisar somente o User do rg associado
        query['rg'] = account.rg
        selectedArr = await User.query().select().where(query)
      }
      else {
        send(res, 401)
      }

      if (selectedArr.length == 0) {
        send(res, 404, 'No Users Found')
      }
      else { send(res, 200, selectedArr) }
    }
    catch (err) { send(res, 500, JSON.stringify(err)) }
  },

  deleteUser: async (req, res) => {
    try {
      const token = req.headers.authorization
      const account = userFromToken(res, token)
      var numberOfDeletedRows

      const query = req.query
      const queryLength = Object.keys(query).length

      const rgFromParams = req.params.rg

      // se usuario nao for admin, deleta a conta assicada ao token
      //se for admin, verifica params e querystrings para deletar
      // Enquanto o user nao precisa fornecer seu rg (pois o user associado ao token 'e automaticamente deletado),
      // o admin precisa dizer quem ele pretende deletar (pelo params ou pela query)
      if (!isAdmin(account)) {
        if ('rg' in query && account.rg != query.rg)
          send(res, 401, 'Cannot Delete Another User')
        else
          numberOfDeletedRows = await User.query().delete().where('users.rg', '=', account.rg)
      }
      else if (isAdmin(account) && rgFromParams != undefined)
        numberOfDeletedRows = await User.query().delete().where('users.rg', '=', rgFromParams)

      else if (isAdmin(account) && rgFromParams == undefined) {
        if (queryLength == 0)
          send(res, 400, 'Either RG in Params Or Query Required')

        else
          numberOfDeletedRows = await User.query().delete().where(query)
      }

      if (numberOfDeletedRows == 0)
        send(res, 404, 'User Not Found')

      else if (numberOfDeletedRows > 0)
        send(res, 200, numberOfDeletedRows + ' Users Deleted!')

      else
        send(res, 400)
    }
    catch (err) { send(res, 500, JSON.stringify(err)) }
  },

  updateUser: async (req, res) => {
    try {
      const token = req.headers.authorization
      const account = userFromToken(res, token)

      if ('rg' in req.params) {
        //verificando se a conta que sera atualizada possui o mesmo rg do token
        if (account.rg == req.params.rg) {
          const rg = req.params.rg
          const dataToUpdate = await json(req) // os dados recebidos para atualizar sao genericos

          if (!isAdmin(account)) { //se o usuario nao for admin ignora o balance
            delete dataToUpdate['balance']
          }

          const numberOfUpdatedRows = await User.query().patch(dataToUpdate).where('users.rg', '=', rg)
          if (numberOfUpdatedRows == 0) {
            send(res, 404, 'RG Not Found')
          }
          else {
            send(res, 200, 'Updated')
          }
        }
        else { send(res, 401) }
      }
      else {
        send(res, 400, 'Bad Parameters - rg Required')
      }
    }
    catch(err) { send(res, 500, JSON.stringify(err)) }
  }
}