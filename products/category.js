const { Category } = require('./models/schema')

const { json, send } = require('micro')

const { userFromToken, isAdmin } = require('./helper')

// createCategory, getCategory, updateCategory, deleteCategory
module.exports = {
  // name obrigatorio
  createCategory: async (req, res) => {
    try {
      const token = req.headers.authorization
      const user = userFromToken(res, token)

      const parsedJson = await json(req)

      if (isAdmin(user) && ('name' in parsedJson)) {
        await Category.query().insert(parsedJson)
        send(res, 200, 'Category Created!')
      } else if (!isAdmin(user)) {
        send(res, 401)
      } else { // se for admin mas nao passou 'name' no json
        send(res, 400, 'Bad Parameters - name Required')
      }
    } catch (err) { send(res, 500, JSON.stringify(err)) }
  },

  // query generica
  // se nao passar nenhuma query, seleciona todas as categorias
  getCategory: async (req, res) => {
    const query = req.query
    // const queryLength = Object.keys(query).length

    var selectedArr = []

    if ('name' in req.params) {
      const categoryName = req.params.name
      selectedArr = await Category.query().select().where('name', '=', categoryName)
    } else {
      selectedArr = await Category.query().select().where(query)
    }

    if (selectedArr.length == 0) { send(res, 404, 'No Categories Found') } else { send(res, 200, selectedArr) }
  },

  updateCategory: async (req, res) => {
    try {
      const token = req.headers.authorization
      const user = userFromToken(res, token)

      console.log(JSON.stringify(user))

      if (!isAdmin(user)) {
        send(res, 401) // Unauthorized
      } else if (isAdmin(user)) {
        const categoryToBeUpdated = req.params.name // nome atual da categoria que sera atualizada (recebido na query)
        const parsedJson = await json(req) // nome para o qual sera atualizado

        if (categoryToBeUpdated == undefined) // verificando path
        { send(res, 400, 'Category In Path Required') } else {
          const numberOfUpdatedRows = await Category.query().patch(parsedJson).where('name', '=', categoryToBeUpdated)
          if (numberOfUpdatedRows == 0) { send(res, 404, 'No Categories Found') } else { send(res, 200, 'Category has been updated') }
        }
      }
    } catch (err) { send(res, 500, JSON.stringify(err)) }
  },

  // passar "name" da categoria ou na querystring ou diretamente no Path
  deleteCategory: async (req, res) => {
    try {
      const token = req.headers.authorization
      const user = userFromToken(res, token)

      var numberOfUpdatedRows

      if (!isAdmin(user)) {
        send(res, 401) // Unauthorized
      } else if (isAdmin(user)) {
        const categoryToBeDeleted = req.params.name // nome atual da categoria que sera deletada

        // se o nome da categoria nao estiver path, deleta atraves da query generica
        if (categoryToBeDeleted == undefined) {
          const query = req.query
          const queryLength = Object.keys(query).length
          if (queryLength == 0) { send(res, 400, 'Either Provide a Query or Category In Path') } else if (queryLength != 0) { numberOfUpdatedRows = await Category.query().delete().where(query) }
        } else // se o name da categoria estiver no path, deleta a categoria com esse nome
        { numberOfUpdatedRows = await Category.query().delete().where('name', '=', categoryToBeDeleted) }

        if (numberOfUpdatedRows == 0) { send(res, 404, 'No Categories Found') } else { send(res, 200, numberOfUpdatedRows + 'Categories Have Been Deleted!') }
      }
    } catch (err) { send(res, 500, JSON.stringify(err)) }
  }
}
