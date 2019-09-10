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
      const {guess} = req.body
    console.log(guess)
    if(!guess){
      return res.status(400).json({error:"Missing 'guess' in request body"})
    } 
    const words = await LanguageService.getLanguageWords(req.app.get('db'), req.language.id)
    const answer = await LanguageService.getAnswer(guess, req.app.get('db'), req.language.id)
    console.log(words)
    words.sort(function(a,b){
      words[a].memory_value - words[b].memory_value;
    })
    console.log(words)
   /*  if(answer === []){
      //do something
    }
    else {

      answer.memory_value = answer.memory_value *2 
//set answer's pointer o x2 places down --change prev to point to answer
//set head to answer's next pointer
let newHead = words[1]
answer.next = words[answer.memory_value]
words[answer.memory_value].next = answer
newHead.next = words[2]
      LanguageService.rightAnswer(answer, words)
    } */
    console.log(answer)
    res.status(200).json({answer})
  }
  catch(error){
    next(error)
  }
})

module.exports = languageRouter
