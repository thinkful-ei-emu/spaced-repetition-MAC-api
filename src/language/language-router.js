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
      const head = await LanguageService.getLanguageHead(
        req.app.get('db'),
        req.language.head,
      )
      
      res.json(head)
     
      next()
    } 
   catch (error) {
      next(error)
    }
  })
  
/* .get(jsonBodyParser, (req, res, next)=>{
  const head = LanguageService.getLanguageHead(res.words)
  return res.json({
    nextWord: head.value.original,
    wordCorrectCount: head.value.correct_count,
    wordIncorrectCount: head.value.incorrect_count,
    totalScore: head.value.total_score
  })
}) */

languageRouter
  .post('/guess', jsonBodyParser, async(req, res, next) => {
    try {
      const {guess, original} = req.body
    console.log(guess, original)
    if(!guess){
      return res.status(400).json({error:"Missing 'guess' in request body"})
    } 
    const answer = LanguageService.checkAnswer(guess, original, req.app.get('db'), req.language.id)
    console.log(answer)
    res.status(200).json({answer})
  }
  catch(error){
    next(error)
  }
})

module.exports = languageRouter
