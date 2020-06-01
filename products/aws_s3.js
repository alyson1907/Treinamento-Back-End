// Access key ID AKIASNAKXFBTEOUKLAFF
// secretAccessKey: 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

const { Product } = require('./models/schema')

const { userFromToken, isAdmin } = require('./helper')

const { json, send } = require('micro')

const rp = require('request-promise-native')

var AWS = require('aws-sdk')
AWS.config.update({ accessKeyId: 'AKIASNAKXFBTEOUKLAFF', secretAccessKey: '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' })
const s3 = new AWS.S3()
const uuid = require('uuid/v1')

const getFileExtension = (filename) => {
  return filename.split('.').pop()
}

const storeImgUrl = async (code, url) => {
  const numberOfUpdatedRows = await Product.query().patch({ img: url }).where('code', '=', code)
  if (numberOfUpdatedRows != 0) {
    return true
  }
  return false
}

// uploadImg
module.exports = {
  // recebe uma URL de imagem e faz upload para o s3, adicionando a url do upload no DB de produtos e enviando-a como resposta
  uploadImg: async (req, res) => {
    const token = req.headers.authorization
    const account = userFromToken(res, token)

    if (!isAdmin(account)) { send(res, 401) } else {
      const parsedJson = await json(req)
      const imgUrl = parsedJson.img
      const productCode = parsedJson.code
      if (!('code' in parsedJson && 'img' in parsedJson)) {
        send(res, 400, 'Bad Request - code And img Required')
      } else {
        var options = {
          uri: imgUrl,
          encoding: null
        }

        const dataBuffer = await rp(options)

        const params = {
          Bucket: 'prodbckt',
          Key: uuid() + '.' + getFileExtension(imgUrl), // nome do arquivo quando fizer upload
          Body: dataBuffer
        }
        const uploadObj = await s3.upload(params).promise()
        var storeResult = storeImgUrl(productCode, uploadObj.Location) // escrevendo a url da imagem no DB
        storeResult = await storeResult

        if (storeResult === true) { send(res, 200, uploadObj.Location) } else send(res, 500, 'Error While Storing Image URL in Database - Are You Sure The Product Code Is Correct?')
      }
    }
  }
}
