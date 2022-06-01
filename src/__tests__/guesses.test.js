'use strict'

/* eslint-env jest */

const game = require('../controllers/game.controllers')
// import * as guesses from '../controllers/guesses.controllers'
const request = require('supertest')
const express = require('express')
const router = require('../routes/main.routes')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', router)

const correctWordSpy = jest.spyOn(game, 'getGame')
correctWordSpy.mockImplementation(() => ({
  word: { word: 'MOUSE' },
  guesses: [],
  score: [],
  save: () => {}
}))

const vaildWordSpy = jest.spyOn(game, 'wordIsValid')
vaildWordSpy.mockImplementation((word) => {
  const sampleDict = ['mouse', 'house', 'smart', 'pizza']
  return sampleDict.indexOf(word.toLowerCase()) > -1
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('Test Guesses Controller', function () {
  it('tests /api/guess endpoint - Correct word', async () => {
    expect(correctWordSpy).toHaveBeenCalledTimes(0)
    const res = await request(app)
      .post('/api/guess')
      .send({ guess: 'MOUSE', game: '1234' })
      .expect(200)
      .expect('Content-Type', /json/)

    const colour = res.body.colour
    expect(correctWordSpy).toHaveBeenCalledTimes(1)
    expect(colour.length).toBe(5)
    expect(colour).toStrictEqual(['green', 'green', 'green', 'green', 'green'])
  })

  it('tests /api/guess endpoint - First letter wrong', async () => {
    expect(correctWordSpy).toHaveBeenCalledTimes(0)
    const res = await request(app)
      .post('/api/guess')
      .send({ guess: 'HOUSE', game: '1234' })
      .expect(200)
      .expect('Content-Type', /json/)

    const colour = res.body.colour
    expect(correctWordSpy).toHaveBeenCalledTimes(1)
    expect(colour.length).toBe(5)
    expect(colour).toStrictEqual(['gray', 'green', 'green', 'green', 'green'])
  })

  it('tests /api/guess endpoint - Most letters wrong', async () => {
    expect(correctWordSpy).toHaveBeenCalledTimes(0)
    const res = await request(app)
      .post('/api/guess')
      .send({ guess: 'SMART', game: '1234' })
      .expect(200)
      .expect('Content-Type', /json/)

    const colour = res.body.colour
    expect(correctWordSpy).toHaveBeenCalledTimes(1)
    expect(colour.length).toBe(5)
    expect(colour).toStrictEqual(['yellow', 'yellow', 'gray', 'gray', 'gray'])
  })

  it('tests /api/guess endpoint - All letters wrong', async () => {
    expect(correctWordSpy).toHaveBeenCalledTimes(0)
    const res = await request(app)
      .post('/api/guess')
      .send({ guess: 'PIZZA', game: '1234' })
      .expect(200)
      .expect('Content-Type', /json/)

    const colour = res.body.colour
    expect(correctWordSpy).toHaveBeenCalledTimes(1)
    expect(colour.length).toBe(5)
    expect(colour).toStrictEqual(['gray', 'gray', 'gray', 'gray', 'gray'])
  })

  it('tests /api/guess endpoint - Too Long Word', async () => {
    expect(correctWordSpy).toHaveBeenCalledTimes(0)
    const res = await request(app)
      .post('/api/guess')
      .send({ guess: 'MOUSES', game: '1234' })
      .expect(400)
      .expect('Content-Type', /json/)
    expect(res.body.code).toBe('error')
  })

  it('tests /api/guess endpoint - Too Short Word', async () => {
    expect(correctWordSpy).toHaveBeenCalledTimes(0)
    const res = await request(app)
      .post('/api/guess')
      .send({ guess: 'MICE', game: '1234' })
      .expect(400)
      .expect('Content-Type', /json/)
    expect(res.body.code).toBe('error')
  })

  it('tests /api/guess endpoint - Invalid word', async () => {
    expect(correctWordSpy).toHaveBeenCalledTimes(0)
    const res = await request(app)
      .post('/api/guess')
      .send({ guess: 'ASDFS', game: '1234' })
      .expect(400)
      .expect('Content-Type', /json/)
    expect(res.body.code).toBe('error')
  })

  it('tests /api/guess endpoint - Correct word guessed on first turn', async () => {
    expect(correctWordSpy).toHaveBeenCalledTimes(0)
    const res = await request(app)
      .post('/api/guess')
      .send({ guess: 'MOUSE', game: '1234', i: 0 })
      .expect(200)
      .expect('Content-Type', /json/)

    const colour = res.body.colour
    expect(correctWordSpy).toHaveBeenCalledTimes(1)
    expect(colour.length).toBe(5)
    expect(colour).toStrictEqual(['green', 'green', 'green', 'green', 'green'])

    const score = res.body.score
    expect(score).toBe(500)
  })

  it('tests /api/guess endpoint - Correct word guessed on Fifth turn', async () => {
    expect(correctWordSpy).toHaveBeenCalledTimes(0)
    const res = await request(app)
      .post('/api/guess')
      .send({ guess: 'MOUSE', game: '1234', i: 4 })
      .expect(200)
      .expect('Content-Type', /json/)

    const colour = res.body.colour
    expect(correctWordSpy).toHaveBeenCalledTimes(1)
    expect(colour.length).toBe(5)
    expect(colour).toStrictEqual(['green', 'green', 'green', 'green', 'green'])

    const score = res.body.score
    expect(score).toBe(20)
  })

  it('tests /api/guess endpoint - Almost correct word', async () => {
    expect(correctWordSpy).toHaveBeenCalledTimes(0)
    const res = await request(app)
      .post('/api/guess')
      .send({ guess: 'HOUSE', game: '1234', i: 0 })
      .expect(200)
      .expect('Content-Type', /json/)

    const colour = res.body.colour
    expect(correctWordSpy).toHaveBeenCalledTimes(1)
    expect(colour.length).toBe(5)
    expect(colour).toStrictEqual(['gray', 'green', 'green', 'green', 'green'])

    const score = res.body.score
    expect(score).toBe(400)
  })

})
