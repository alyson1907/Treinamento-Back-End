const Knex = require('knex')

const env = process.env.NODE_ENV == undefined ? 'development' : process.env.NODE_ENV
const connection = require('../knexfile')[ process.env.NODE_ENV || 'development']
console.log("CONNECTION >>>>>>>>" + JSON.stringify(connection))

const { Model } = require('objection')
const knexConnection = Knex(connection)

Model.knex(knexConnection)

class ModelWithTimestamps extends Model {
  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
  
  $beforeInsert() {
    this.createdAt = new Date().toISOString();
  }
}

class Account extends ModelWithTimestamps {

  static get tableName() {
    return 'accounts';
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'accounts.userRg',
          to: 'users.rg'
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'userRg', 'password'],
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        userRg: { type: 'string', minLength: 9, maxLength: 9 },
        accessLevel: { type: 'string' }
      }
    }
  }
}

class User extends ModelWithTimestamps {

  static get tableName() {
    //nome da tabela no DB
    return "users";
  }

  static get relationMappings() {
    return {
      accounts: {
        relation: Model.HasManyRelation,
        modelClass: Account,
        join: {
          from: 'users.rg',
          to: 'accounts.userRg'
        }
      }
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['rg'],
      properties: {
        rg: { type: 'string', minLength: 9, maxLength: 9 },
        name: { type: 'string' },
        age: { type: 'number' }
      }
    }
  }
}

module.exports = { User, Account }