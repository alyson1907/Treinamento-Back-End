const { Product } = require('./models/schema')

const { json, send } = require('micro')

const { userFromToken, isAdmin } = require('./helper')

// createProduct, getProducts, updateProduct, deleteProduct
module.exports = {
  // Obrigatorio: code, category e price
  createProduct: async (req, res) => {
    try {
      const token = req.headers.authorization
      const user = userFromToken(res, token)

      if (!isAdmin(user)) {
        send(res, 401)
      } else if (isAdmin(user)) {
        const parsedJson = await json(req)
        if (('code' in parsedJson) && ('category' in parsedJson) && ('price' in parsedJson)) {
          try {
            await Product.query().insert(parsedJson)
            send(res, 200, 'Product Created!')
          } catch (e) {
            send(res, 500, e)
          }
        } else { send(res, 400, 'Bad Parameters - code, price And category Required') }
      }
    } catch (err) { send(res, 500, JSON.stringify(err)) }
  },

  // se houver code no path, retorna o produto com aquele code
  // se nao houver, checa as querystrings e retorna os produtos associados a elas
  getProducts: async (req, res) => {
    try {
      const code = req.params.code

      const query = req.query
      const queryLength = Object.keys(query).length

      var selectedArr = []

      // se nao houver code no path, checa as querystrings
      if (code == undefined && queryLength == 0) { selectedArr = await Product.query().select() } else if (code == undefined && queryLength != 0) { // se nao houver path mas houver querystring
        if ('price' in query) { query.price = parseFloat(query.price) }
        selectedArr = await Product.query().select().where(query)
      } else // procura pelo code do path
      { selectedArr = await Product.query().select().where('code', '=', code) }

      if (selectedArr.length == 0) { send(res, 404, 'No Products Found') } else { send(res, 200, selectedArr) }
    } catch (err) { send(res, 500, JSON.stringify(err)) }
  },

  // obridatorio: querystring ?code= com o codigodo produto
  updateProduct: async (req, res) => {
    try {
      const token = req.headers.authorization
      const user = userFromToken(res, token)

      if (!isAdmin(user)) { send(res, 401) } // Unauthorized

      else if (isAdmin(user)) {
        const code = req.params.code
        const parsedJson = await json(req)

        const query = req.query
        const queryLength = Object.keys(query).length

        var numberOfUpdatedRows

        // se nao houver code no path, checa as querystrings
        if (code == undefined && queryLength == 0) { send(res, 400, 'Either Provide a Query or Code in Path') } else if (code == undefined && queryLength != 0) { // se nao houver path mas houver querystring
          if ('price' in query) { query.price = parseFloat(query.price) }
          numberOfUpdatedRows = await Product.query().patch(parsedJson).where(query)
        } else // procura pelo code do path
        { numberOfUpdatedRows = await Product.query().patch(parsedJson).where('code', '=', code) }

        if (numberOfUpdatedRows == 0) { send(res, 404, 'No Products have been Updated') } else { send(res, 200, numberOfUpdatedRows + ' Products Updated!') }
      }
    } catch (err) { send(res, 500, JSON.stringify(err)) }
  },

  deleteProduct: async (req, res) => {
    try {
      const token = req.headers.authorization
      const user = userFromToken(res, token)

      if (!isAdmin(user)) {
        send(res, 401)
      } // Unauthorized

      else if (isAdmin(user)) {
        const code = req.params.code

        const query = req.query
        const queryLength = Object.keys(query).length

        var numberOfDeletedRows

        // se nao houver code no path, checa as querystrings
        if (code == undefined && queryLength == 0) {
          send(res, 400, 'Either Provide a Query or Code in Path')
        } else if (code == undefined && queryLength != 0) { // se nao houver path mas houver querystring
          if ('price' in query) {
            query.price = parseFloat(query.price)
          }
          numberOfDeletedRows = await Product.query().delete().where(query)
        }
        // procura pelo code do path
        else {
          numberOfDeletedRows = await Product.query().delete().where('code', '=', code)
        }

        if (numberOfDeletedRows == 0) {
          send(res, 404, 'No Products have been Deleted')
        } else {
          send(res, 200, numberOfDeletedRows + ' Products Deleted!')
        }
      }
    } catch (err) { send(res, 500, JSON.stringify(err)) }
  }
}
