/* eslint-disable */
const nock = require('nock')
const supertest = require('supertest')
const server = require('../index')

const { Product, Category } = require('../models/schema')

const uuid = require('uuid/v1')

let testUser = { "rg": "999999999", "name": "popo", "age": 20 }
let adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFseUBlbWFpbC5jb20iLCJyZyI6IjEyMzEyMzEyMyIsImFjY2Vzc0xldmVsIjoiYWRtaW4iLCJpYXQiOjE1NjUxMjE0NTYsImlzcyI6IkxpdmVuIn0.K-mfcHRSMC_d2jaAXloO1UDwgiTaBxt_iJQOfvjlqA8'
let testUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3R1c2VyQGVtYWlsLmNvbSIsInJnIjoiOTk5OTk5OTk5IiwiYWNjZXNzTGV2ZWwiOiJ1c2VyIiwiaWF0IjoxNTY1MzcxNTg1LCJpc3MiOiJMaXZlbiJ9.Z0OX5muC_hL0HmlFjlIxmP1dZgz2-5N0-DIDSG5uxxo'

let testCategory = { name: 'testcat' }
let testProduct = { code: 'testcode123', category: testCategory.name, qty: 100, price: 0 }

beforeAll(async () => {
  //nock.disableNetConnect()
  await Category.query().insert(testCategory)
  await Product.query().insert(testProduct)

  nock('https://alyson.now.sh') //adicionar url ao helper ou connection file
    .post('/purch/user')
    .reply(200)
})

afterAll(async () => {
  await Product.query().delete().where(testProduct)
  await Category.query().delete().where(testCategory)
  //nock.enableNetConnect()
  nock.restore()
})

describe('POST /purch - Testing Purchase System', () => {

  describe('POST /purch - Testing Erros (statusCode 4XX)', () => {
    test('Missing code/qty in req.body --> expecting 400', (done) => {
      supertest(server)
        .post('/purch')
        .set('authorization', testUserToken)
        .send({})
        .expect(400)
        .end(done)
    })

    test('Sending invalid product code --> expecting 400', (done) => {
      const randomCode = uuid()
      supertest(server)
        .post('/purch')
        .set('authorization', testUserToken)
        .send({ code: randomCode, qty: 1 })
        .expect(400)
        .end(done)
    })

    test('Products qty higher than stock --> expecting 400', (done) => {
      supertest(server)
        .post('/purch')
        .set('authorization', testUserToken)
        .send({ code: testProduct.code, qty: Number.MAX_SAFE_INTEGER })
        .expect(400)
        .end(done)
    })
  })

  describe('POST /purch - Testing Purchase Successful', () => {
    test('purchase OK! --> expecting 200', (done) => {
      supertest(server)
        .post('/purch')
        .set('authorization', testUserToken)
        .send({ code: testProduct.code, qty: 10 })
        .expect(res => console.log(JSON.stringify(res)))
        .expect(200)
        .end(done)
    })
  })
})
