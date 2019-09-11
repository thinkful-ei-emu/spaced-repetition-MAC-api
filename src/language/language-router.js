const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const jsonBodyParser = express.json();
const languageRouter = express.Router();

languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get("/", async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );
    res.json({
      language: req.language,
      words
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.all("/head", async (req, res, next) => {
  try {
    const head = await LanguageService.getLanguageHead(
      req.app.get("db"),
      req.language.head
    );

    res.json(head);

    next();
  } catch (error) {
    next(error);
  }
});

/* .get(jsonBodyParser, (req, res, next)=>{
  const head = LanguageService.getLanguageHead(res.words)
  return res.json({
    nextWord: head.value.original,
    wordCorrectCount: head.value.correct_count,
    wordIncorrectCount: head.value.incorrect_count,
    totalScore: head.value.total_score
  })
}) */

languageRouter.post("/guess", jsonBodyParser, async (req, res, next) => {
  try {
    const { guess } = req.body;
    console.log(guess);
    if (!guess) {
      return res.status(400).json({ error: "Missing 'guess' in request body" });
    }
    let words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );
    let answer = await LanguageService.getLanguageHead(
      req.app.get("db"),
      req.language.id
    );
    answer = answer[0];
    let response = {};
    if (answer.translation != guess) {
      //do {
      /*   "nextWord": "test-next-word-from-incorrect-guess",
  "wordCorrectCount": 888,
  "wordIncorrectCount": 111,
  "totalScore": 999,
  "answer": "test-answer-from-incorrect-guess",
  "isCorrect": false
} */
      response = {
        nextWord: words[1].original,
        wordCorrectCount: answer.correct_count,
        wordIncorrectCount: answer.incorrect_count + 1,
        totalScore: answer.total_score,
        answer: answer.translation,
        isCorrect: false
      };
      //if answer incorrect: reset memory value to 1, move back 1 spot in list//to second--basically swap
      answer.memory_value = 1;
      answer.incorrect_count = answer.incorrect_count + 1;
      let newHead = words[answer.next];
      let incorrectlyAnswered = answer;
      let placeholder = newHead.next;
      newHead.next = incorrectlyAnswered;
      incorrectlyAnswered.next = placeholder;
      console.log('INCORRECT ANSWER', incorrectlyAnswered)
      console.log('NEW HEAD', newHead)
      
    /*   LanguageService.wrongAnswer(
        newHead,
        incorrectlyAnswered,
        insertAfter,
        req.app.get("db"),
        req.language.id
      ); */
    } else {
      answer.memory_value = answer.memory_value * 2;
      answer.totalScore = answer.total_score + 1;
      answer.correct_count = answer.correct_count + 1;
      //set answer's pointer o x2 places down --change prev to point to answer
      //set head to answer's next pointer
      let newHead = words[1];
      let insertAfter = {};
      //need to find the spot for the answer to go into--m spots away
      if(answer.memory_value > words.length){
        insertAfter = words[words.length-1]
        insertAfter.next = answer;
        answer.next = null;
      } 
      else {
      for (let i = 0; i < answer.memory_value; i++) {
        insertAfter = words[i];
      }
      let answerNext = insertAfter.next;
      insertAfter.next = answer;
      answer.next = answerNext;
      newHead.next = words[2];
    }
      console.log('INSERT AFTER LOOP', insertAfter)
      
      console.log('CORRECT ANSWER', answer)
      console.log('NEW HEAD', newHead)
      console.log("INSERT AFTER", insertAfter)
     /*  LanguageService.rightAnswer(
        newHead,
        answer,
        insertAfter,
        req.app.get("db"),
        req.language.id
      ); */
    }
    res.status(200).json({ answer });
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
