const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonBodyParser = express.json()
const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )
      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .all('/head', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWordsTwo(
        req.app.get('db'),
        req.language.id,
      )
      res.words = words
      next()
    } 
   catch (error) {
      next(error)
    }
  })
.get(jsonBodyParser, (req, res, next)=>{
  const head = LanguageService.getLanguageHead(res.words)
  return res.json({
    nextWord: head.value.original,
    wordCorrectCount: head.value.correct_count,
    wordIncorrectCount: head.value.incorrect_count,
    totalScore: head.value.total_score
  })
})

languageRouter
  .post('/guess', async (req, res, next) => {
    // implement me
    res.send('implement me!')
  })

module.exports = languageRouter
