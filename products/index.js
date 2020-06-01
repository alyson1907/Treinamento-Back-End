const { Product, Purchase, ItemPurchased } = require('./models/schema')
const { createCategory, getCategory, updateCategory, deleteCategory } = require('./category')
const { createProduct, getProducts, updateProduct, deleteProduct } = require('./product')

const { userFromToken, isAdmin } = require('./helper')

const { json, send } = require('micro')

const { router, get, patch, post, del } = require('microrouter')

const rp = require('request-promise-native')

var { uploadImg } = require('./aws_s3')

// Recebe requisicao contendo o token no header (authorization), e o codigo do produto + quantidade no json
// envia requisicao para o microsservico do user para debitar o preco da compra
// aguarda resposta
// responde com o codigo final
const singlePurchase = async (req, res) => {
  const parsedPurchase = await json(req)
  const token = req.headers.authorization
  const user = userFromToken(res, token)

  // se nao for passado Code e Qty no json
  if (!('code' in parsedPurchase && 'qty' in parsedPurchase)) {
    send(res, 400, 'Bad Request - code And qty needed in json')
  } else {
    const productCode = parsedPurchase.code
    const productQty = parsedPurchase.qty
    const productArr = await Product.query().select().where('code', '=', productCode)
    // se o produto nao consta no DB
    if (productArr.length == 0) {
      send(res, 400, 'Bad Request - Invalid Product Code')
    } else {
      var product = productArr[0]

      // enviando req para o microsservico de user
      try {
        const response = await rp({
          method: 'POST',
          uri: 'https://alyson.now.sh/purch/user',
          headers: {
            authorization: token
          },
          body: {
            totalPrice: product.price * productQty
          },
          json: true,
          resolveWithFullResponse: true
        })
        // se o microsservico de user respnder com "OK"
        if (response.statusCode == 200) {
          // verifica a disponibilidade do produto
          if ((product.qty - productQty) > 0) {
            product.qty -= productQty
            const numberOfUpdatedRows = await Product.query().patch(product).where('code', '=', productCode)
            // se compra foi concluida
            if (numberOfUpdatedRows > 0) {
              try { // adiciona a compra no DB
                const purchase = await Purchase.query().insert({ totalPrice: product.price * productQty, rg: user.rg })
                await ItemPurchased.query().insert({ itemCode: product.code, qty: productQty, purchaseId: purchase.id })
                send(res, 200, 'Purchase Successful')
              } catch (e) {
                send(res, 500, e)
              }
            } else { send(res, 400) } // se nenhuma tupla foi alterada
          } else { send(res, 400, 'Products Quantity Higher Than Stock') } // se nao houver a qtde de produtos necessaria para a compra
        } else { send(res, response.statusCode) } // caso haja erro do microsserbico do user
      } catch (e) {
        send(res, e.statusCode, e.error)
      }
    }
  }
}

// se nao tiver querystring, retorna todas as compras, senao filtra pelo id
const getPurchases = async (req, res) => {
  const query = req.query

  const token = req.headers.authorization
  const account = userFromToken(res, token)

  if (isAdmin(account)) {
    const selectedArr = await Purchase.query().join('itemsPurchased', 'itemsPurchased.purchaseId', 'purchases.id').select('purchases.*', 'itemsPurchased.*').where(query)
    if (selectedArr.length == 0) {
      send(res, 404, 'No Purchases Found')
    } else { send(res, 200, selectedArr) }
  } else if (!isAdmin(account)) {
    // colocando o rg do user na query para fazer a busca somente nas compras desse rg
    query['rg'] = account.rg
    const selectedArr = await Purchase.query().join('itemsPurchased', 'itemsPurchased.purchaseId', 'purchases.id').select('purchases.*', 'itemsPurchased.*').where(query)
    if (selectedArr.length == 0) {
      send(res, 404, 'No Purchases Found')
    } else { send(res, 200, selectedArr) }
  }
}

module.exports = router(
  post('/purch', singlePurchase),
  get('/purch', getPurchases),

  post('/img/upload', uploadImg),

  post('/categories', createCategory),
  get('/categories', getCategory),
  get('/categories/:name', getCategory),
  patch('/categories/:name', updateCategory),
  del('/categories/:name', deleteCategory),
  del('/categories', deleteCategory),

  post('/products', createProduct),
  get('/products', getProducts),
  get('/products/:code', getProducts),
  patch('/products/:code', updateProduct),
  patch('/products', updateProduct),
  del('/products/:code', deleteProduct),
  del('/products', deleteProduct)
)
