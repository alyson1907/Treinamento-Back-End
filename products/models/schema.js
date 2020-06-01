const Knex = require('knex')

const connection = require('../knexfile')[process.env.NODE_ENV || 'development']
console.log('CONNECTION>>>>>>>> ' + JSON.stringify(connection))

const { Model } = require('objection')

const knexConnection = Knex(connection)

Model.knex(knexConnection)

class ModelWithTimestamps extends Model {
  $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }

  $beforeInsert () {
    this.createdAt = new Date().toISOString()
  }
}

class Category extends ModelWithTimestamps {
  static get tableName () {
    return 'categories'
  }

  static get relationMappings () {
    return {
      products: {
        relation: Model.HasManyRelation,
        modelClass: Product,

        join: {
          from: 'categories.name',
          to: 'products.category'
        }
      }
    }
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' }
      }
    }
  }
}

class Product extends ModelWithTimestamps {
  static get tableName () {
    return 'products'
  }

  static get relationMappings () {
    return {
      productCategory: {
        relation: Model.BelongsToOneRelation,
        modelClass: Category,

        join: {
          from: 'products.category',
          to: 'categories.name'
        }
      },

      itemsPurchased: {
        relation: Model.HasManyRelation,
        modelClass: ItemPurchased,

        join: {
          from: 'products.code',
          to: 'itemsPurchased.itemCode'
        }
      }
    }
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['code', 'category', 'price'],
      properties: {
        code: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'float' },
        category: { type: 'string' },
        img: { type: 'string' }
      }
    }
  }
}

class Purchase extends ModelWithTimestamps {
  static get tableName () {
    return 'purchases'
  }

  static get relationMappings () {
    return {
      items: {
        relation: Model.ManyToManyRelation,
        modelClass: ItemPurchased,

        join: {
          from: 'purchases.id',
          to: 'itemsPurchased.purchaseId'
        }
      }
    }
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['totalPrice', 'rg'],
      properties: {
        id: { type: 'integer' },
        totalPrice: { type: 'float' },
        rg: { type: 'string', minLength: 9, maxLength: 9 },
        date: { type: 'string' }
      }
    }
  }
}

class ItemPurchased extends ModelWithTimestamps {
  static get tableName () {
    return 'itemsPurchased'
  }

  static get relationMappings () {
    return {
      purchases: {
        relation: Model.ManyToManyRelation,
        modelClass: Purchase,

        join: {
          from: 'itemsPurchased.purchaseId',
          to: 'purchases.id'
        }
      },
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,

        join: {
          from: 'itemsPurchased.itemCode',
          to: 'products.code'
        }
      }
    }
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['itemCode', 'qty', 'purchaseId'],
      properties: {
        itemCode: { type: 'string' },
        qty: { type: 'integer' },
        purchaseId: { type: 'integer' }
      }
    }
  }
}

module.exports = { Category, Product, ItemPurchased, Purchase }
