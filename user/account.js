const { Account } = require('./models/schema')
const { userFromToken, isAdmin } = require('./helper')

const bcrypt = require('bcrypt')
const saltRounds = 8

const { json, send } = require('micro')

const removeAcessLevelFromObj = obj => {
  delete obj['accessLevel']
  return obj
}

// createAccount, getUserAccounts, deleteAccount, updateAccount
module.exports = {
  //Precisa de email e userRg
  createAccount: async (req, res) => {
    try {
      const accountData = await json(req)
      //>>>>>>> removeAcessLevelFromObj(accountData)
      if (('email' in accountData) && ('userRg' in accountData) && ('password' in accountData)) {
        //criptografando senha
        const hash = await bcrypt.hash(accountData.password, saltRounds)
        accountData['password'] = hash

        //criando conta no DB
        await Account.query().insert(accountData)
        send(res, 200, 'Account Created!')

      }
      else {
        send(res, 400, 'Bad Parameters - email, password and userRg required')
      }
    }
    catch (err) {
      send(res, 500, err)
    }
  },

  //Consulta todas as contas de um determinado usuario (rg)
  //admin pode consultar de qualquer user ou entao todas as contas
  // user somente pode consultar suas contas associadas
  getUserAccounts: async (req, res) => {
    try {
      const token = req.headers.authorization
      const account = userFromToken(res, token)

      const email = req.params.email

      const accountQuery = req.query //queries genericas
      var selectedArr = []

      if (!isAdmin(account)) {
        //retorna todas as contas com account.rg + queries
        accountQuery['userRg'] = account.rg
        selectedArr = await Account.query().select().where(accountQuery)
      }
      //se passou params, pesquisa somente o email especifico
      else if (isAdmin(account) && email != undefined) {
        selectedArr = await Account.query().select().where({ email: email })
      }
      //se nao tiver params, busca pela query
      else if (isAdmin(account) && email == undefined) {
        selectedArr = await Account.query().select().where(accountQuery)
      }
      if (selectedArr.length == 0)
        send(res, 404, 'No Accounts Found')

      else
        send(res, 200, selectedArr)
    }

    catch (err) {
      send(res, 500, err)
    }
  },

  // se houver email no path, deleta a account associada `a esse email
  //      no caso de user, verifica se a conta 'e dele (rg da conta do path == rg do token)

  //se nao houver email no path, deleta as contas associadas `a uma query (somente ADMIN), ou
  // entao (se for um user) retorna 400 'Provide An Email In Path''
  deleteAccount: async (req, res) => {
    try {
      const token = req.headers.authorization
      const account = userFromToken(res, token)
      var numberOfDeletedRows

      const query = req.query
      const queryLength = Object.keys(query).length
      if ('email' in req.params) {
        const emailToBeDeleted = req.params.email
        //se user nao for admin:
        //        verifica se account.rg == rg da conta do path. Se sim, deleta a conta do path
        //se for admin, mas nao enviou nenhuma query, deleta a conta do path
        // se for admin e enviou query, deleta as accounts associadas `aquela query

        if (!isAdmin(account)) {
          //um usuario comum somente pode deletar contas associadas ao seu rg
          const selectedAccountArr = await Account.query().select('userRg').where('email', '=', emailToBeDeleted)
          if (selectedAccountArr[0].rg != undefined && selectedAccountArr[0].rg == account.rg)
            numberOfDeletedRows = await Account.query().delete().where('userRg', '=', account.rg)

          else
            send(res, 401, 'Cannot Delete Another Account')

        }
        else if (isAdmin(account))  //se for admin, mas nao enviou nenhuma query, deleta a conta do path
          numberOfDeletedRows = await Account.query().delete().where('email', '=', emailToBeDeleted)

      }
      else { // nao ha email no path
        if (isAdmin(account) && queryLength > 0)
          numberOfDeletedRows = await Account.query().delete().where(query)

        else if (isAdmin(account) && queryLength === 0)
          send(res, 400, 'Either a Query Or Email In Path Required')

        else
          send(res, 400, 'Provide An Email In Path')

      }

      if (numberOfDeletedRows == 0)
        send(res, 404, 'No Accounts Found')

      else if (numberOfDeletedRows > 0)
        send(res, 200, 'Deleted!')

      else
        send(res, 400)
    }
    catch (err) {
      send(res, 500, err)
    }
  },

  updateAccount: async (req, res) => {
    try {
      const token = req.headers.authorization
      const account = userFromToken(res, token)

      if ('currEmail' in req.params) {
        const currEmail = req.params.currEmail

        //verificando se a conta que sera atualizada ( vinda dos params) possui o mesmo email do token
        const selectedAccountArr = await Account.query().select('userRg').where('email', '=', currEmail)
        if (selectedAccountArr[0] != undefined && account.rg == selectedAccountArr[0].userRg) {
          const currEmail = req.params.currEmail
          const dataToUpdate = await json(req) // os dados recebidos para atualizar sao genericos
          //verificando se foi passado password para ser atualizado
          if ('password' in dataToUpdate)
            dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, saltRounds)

          if (!isAdmin(account)) { //se o usuario nao for admin ignora o accessLevel
            removeAcessLevelFromObj(dataToUpdate)
          }

          const numberOfUpdatedRows = await Account.query().patch(dataToUpdate).where('email', '=', currEmail)
          if (numberOfUpdatedRows == 0)
            send(res, 404, 'Account Not Found')

          else
            send(res, 200, 'Updated')

        }
        else
          send(res, 401)
      }
      else {
        send(res, 400, 'Bad Parameters - currEmail Required')
      }
    }
    catch (err) {
      send(res, 500, err)
    }
  }
}
