const helper = require('./testHelper')[process.env.NODE_ENV || 'development']
console.log(`HELPER :::::::::::::::::: ${JSON.stringify(helper)}`)
const { createUser, getUser, deleteUser, updateUser } = require('../user')
const { User } = require('../models/schema')
const micro = require('micro')

const supertest = require('supertest')
const server = require('../index')

let testUser = { "rg": "999999999", "name": "popo", "age": 20 }
let adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFseUBlbWFpbC5jb20iLCJyZyI6IjEyMzEyMzEyMyIsImFjY2Vzc0xldmVsIjoiYWRtaW4iLCJpYXQiOjE1NjUxMjE0NTYsImlzcyI6IkxpdmVuIn0.K-mfcHRSMC_d2jaAXloO1UDwgiTaBxt_iJQOfvjlqA8'
let userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVkdTNAZW1haWwuY29tIiwicmciOiI0NTYxMjMxMjMiLCJpYXQiOjE1NjQxNDg3OTksImlzcyI6IkxpdmVuIn0.uR4tfUbYJsYqEnFxtMP6Dyx3HA7aj3YhQTWtJc5OmkU'
describe('POST /user (createUser)', () => {
  beforeEach(() => {
    testUser = { "rg": "999999999", "name": "popo", "age": 20 }
  })

  afterEach(async () => {
    await User.query().delete().where({ "rg": "999999999" })
  })

  afterAll(() => {
    testUser = { "rg": "999999999", "name": "popo", "age": 20 }
  })

  test('createUser without rg --> expecting 400 (Bad params)', (done) => {
    delete testUser['rg']
    supertest(server).post('/user')
      .send(testUser)
      .expect(400)
      .end(done)
  })

  test('createUser without name --> expecting 400 (Bad params)', (done) => {
    delete testUser['name']
    supertest(server).post('/user')
      .send(testUser)
      .expect(400)
      .end(done)
  })

  test('createUser OK --> expecting 200', (done) => {

    supertest(server)
      .post('/user')
      .send(testUser)
      .expect(200)
      .expect('User Created!')
      .end(done)
    /*
    .end((err, res) => {
      if (err) {
        done.fail(err)
      }
      else {
        done()
      }
    })
    */
  })
})


describe('GET /user (createUser)', () => {
  beforeAll( async () => {
    await User.query().insert(testUser)
  })

  beforeAll( async () => {
    await User.query().delete().where({ "rg": "999999999" })
  })
  
  test.only('GET /user/:rg (params) OK --> expecting 200', (done) => {
    supertest(server)
    .post('/user/999999999')
    .set('authorization', adminToken)
    .expect(200)
    .end(done)
  })
})