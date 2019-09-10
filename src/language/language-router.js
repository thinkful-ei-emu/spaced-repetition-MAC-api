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
        req.language.id,
      )
      res.head = head
     
      next()
    } 
   catch (error) {
      next(error)
    }
  })
.get(jsonBodyParser, (req, res, next)=>{
  try{
    if (!res.head[0])
    return res.status(404).json({
      error: `Cannot find word`,
    })
    return res.json(res.head[0])
  } 
  catch (error) {
    next(error) 
  }  

})

languageRouter
  .post('/guess', async (req, res, next) => {
    // implement me
    res.send('implement me!')
  })

module.exports = languageRouter
