'use strict'

/* eslint-env jest */

const express = require('express')
const request = require('supertest')
const router = require('../routes/main.routes')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/', router)

const db = require('../models/dbTest')

beforeAll(async () => {
  await db.connect()
  await db.seed()
})

afterAll(async () => {
  db.close()
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('Testing user authentication', function () {
  it('tests /api/user for an authenticated user', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Accept', 'application/json')
      .send({ username: 'TestUser', token: '1234' })
      .expect(200)
      .expect('Content-Type', /json/)
    const req = res.body
    expect(req.username).toBe('TestUser')
  })
  it('tests /api/user for an unauthenticated user', async () => {
    await request(app)
      .get('/api/user')
      .set('Accept', 'application/json')
      .send({ username: 'John', token: 'password?' })
      .expect('Content-Type', /json/)
      .expect(401)
  })
  it('tests /api/user for an authenticated user using cookies', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Accept', 'application/json')
      .set('Cookie', ['username=TestUser', 'token=1234'])
      .expect(200)
      .expect('Content-Type', /json/)
    const req = res.body
    expect(req.username).toBe('TestUser')
  })
})

describe('Testing user login', function () {
  it('tests valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .set('Accept', 'application/json')
      .send({ username: 'TestUser', password: '1234' })
      .expect(200)
      .expect('Content-Type', /json/)

    const req = res.body
    expect(req.code).toBe('ok')
    expect(req.message).toBe('User authenticated')
  })
  it('tests invalid password', async () => {
    // jest.setTimeout(30000)
    const res = await request(app)
      .post('/api/login')
      .set('Accept', 'application/json')
      .send({ username: 'TestUser', password: '12345' })
      .expect(401)
      .expect('Content-Type', /json/)

    const req = res.body
    expect(req.code).toBe('error')
    expect(req.message).toBe('Invalid credentials')
  })

  it('tests invalid username but correct password', async () => {
    const res = await request(app)
      .post('/api/login')
      .set('Accept', 'application/json')
      .send({ username: 'NotTestUser', password: '1234' })
      .expect(401)
      .expect('Content-Type', /json/)

    const req = res.body
    expect(req.code).toBe('error')
    expect(req.message).toBe('Invalid credentials')
  })
})
