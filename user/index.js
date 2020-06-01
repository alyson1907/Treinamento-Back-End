const { User, Account } = require('./models/schema')

const { router, get, patch, post, del } = require('microrouter')
const { json, send } = require('micro')

var jwt = require('jsonwebtoken');
const auth = require('./auth')


const { userFromToken, privateKey } = require('./helper')
const { createUser, getUser, deleteUser, updateUser } = require('./user')
const { createAccount, getUserAccounts, deleteAccount, updateAccount } = require('./account')


//compra
const singlePurchase = async (req, res) => {
  const token = req.headers.authorization
  const tokenUser = userFromToken(res, token)
  const parsedJson = await json(req)
  const totalPrice = parsedJson.totalPrice //preco do produto comprado

  const selectedArr = await User.query().select().where('rg', '=', tokenUser.rg)
  const user = selectedArr[0]

  if (user.balance - totalPrice < 0) {
    send(res, 400, 'Bad Request - Insuficient Funds')
  }
  else {
    user.balance -= totalPrice
    const numberOfUpdatedRows = await User.query().patch(user).where('rg', '=', tokenUser.rg)

    if (numberOfUpdatedRows > 0) {
      send(res, 200, 'Purchase Successful')
    }
    else {
      send(res, 400)
    }
  }
}

//usado no jwt (login)
const signJwtHeader = {
  issuer: 'Liven',
}

//recebe email e senha atraves do json
//Se o login estiver correto, envia token
const login = async (req, res) => {
  const loginData = await json(req) //recebe email/senha para login

  if (('email' in loginData) && ('password' in loginData)) {
    const checkLogin = await auth.checkLogin(loginData.email, loginData.password) //verifica email/senha e retorna objeto com loginResult(bool) e accessLevel do usuario
    const loginResult = checkLogin.loginResult

    if (loginResult == true) { //se o usuario esta cadastrado
      const selectedArr = await Account.query().select().where('email', '=', loginData.email)
      const generatedToken = jwt.sign({ email: loginData.email, rg: selectedArr[0].userRg, accessLevel: checkLogin.accessLevel }, privateKey, signJwtHeader) //gera um token com o access level
      res.setHeader('authorization', generatedToken)
      send(res, 200)
    }
    else {
      send(res, 401)
    }
  }
  else { send(res, 400, 'Bad Request - email And password Required to login') }
}




const handleErrors = fn => async (req, res) => {
  try {
    const response = await fn(req, res)
    send(res, 200, response)
  } catch (err) {
    console.error(err.stack)
    send(res, 301)
  }
}


module.exports = handleErrors(router(
  post('/login', login),
  post('/purch/user', singlePurchase),

  post('/user', createUser),
  get('/user', getUser),
  get('/user/:rg', getUser),
  patch('/user/:rg', updateUser),
  del('/user', deleteUser),
  del('/user/:rg', deleteUser),

  post('/account', createAccount),
  get('/account', getUserAccounts),
  get('/account/:email', getUserAccounts),
  patch('/account/:currEmail', updateAccount),
  del('/account/:email', deleteAccount),
  del('/account', deleteAccount)
))
