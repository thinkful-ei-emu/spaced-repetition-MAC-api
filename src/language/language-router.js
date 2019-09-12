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

/* languageRouter.all("/head", async (req, res, next) => {
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
}); */

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

    let answer = await LanguageService.getAnswer(
      req.app.get("db"),
      req.language.id,
    );
    answer = answer[0];

    let nextWord = await LanguageService.getNextWord(req.app.get("db"), req.language.id, answer.next)

    console.log('logging answer:', answer);
    console.log('logging nextword:', nextWord);
    let response = {};
    if (answer.translation != guess) {
      //formatting response
      response = {
        nextWord: nextWord[0].original,
        wordCorrectCount: answer.correct_count,
        wordIncorrectCount: answer.incorrect_count + 1,
        totalScore: answer.total_score,
        answer: answer.translation,
        isCorrect: false
      };
      //if answer incorrect: reset memory value to 1, move back 1 spot in list//to second--basically swap
      answer.memory_value = 1;
      answer.incorrect_count = answer.incorrect_count + 1;
      let newHead = nextWord[0] //request to get next word;
      let incorrectlyAnswered = answer;
      let placeholder = newHead.id; //from newhead
     
      console.log("INCORRECT ANSWER", incorrectlyAnswered);
      console.log("NEW HEAD", newHead);
      placeholder = await LanguageService.getNextWord(req.app.get('db'), req.language.id, placeholder)
      newHead.next = incorrectlyAnswered.id; //setting newhead to incorrect anwser id
      incorrectlyAnswered.next = placeholder[0].id;
      await LanguageService.wrongAnswer(
        newHead,
        incorrectlyAnswered,
        placeholder[0],
        req.app.get("db"),
        req.language.id
      );
    } else {
      answer.memory_value = answer.memory_value * 2;
      answer.total_score = answer.total_score + 1;
      answer.correct_count = answer.correct_count + 1;
      //set answer's pointer o x2 places down --change prev to point to answer
      //set head to answer's next pointer
      let newHead = nextWord[0]; //newhead
      let insertAfter;
      //need to find the spot for the answer to go into--m spots away
      if (answer.memory_value > 10) { //based on max id instead of length

        // while (words[i].next !== null) {
        //   insertAfter = words[i];
        //   i++;
        // }
        insertAfter = await LanguageService.getLastWord(req.app.get('db', req.language.id))
        insertAfter[0].next = answer.id;
        answer.next = null;
      } else {
        let placeholderNext = answer.next;
        for (let i = 0; i < answer.memory_value; i++) {
          insertAfter= await LanguageService.getNextWord(req.app.get("db"), req.language.id, placeholderNext);
          console.log('in loop',insertAfter);
          placeholderNext = insertAfter[0].next;
          console.log('placeholder in loop:', placeholderNext);
        }
        insertAfter[0].next = answer.id;
        answer.next = placeholderNext;
      }
      console.log("CORRECT ANSWER", answer);
      console.log("NEW HEAD", newHead);
      console.log("INSERT AFTER", insertAfter);
      await LanguageService.rightAnswer(
        newHead,
        answer,
        insertAfter[0],
        req.app.get("db"),
        req.language.id
      );

      response = {
        nextWord: newHead.original,
        wordCorrectCount: answer.correct_count,
        wordIncorrectCount: answer.incorrect_count,
        totalScore: answer.total_score,
        answer: answer.translation,
        isCorrect: true
      };
    }
    res.status(200).json({ response });
  } catch (error) {
    next(error);
  }
});

languageRouter
  .all('/head', async (req, res, next) => {
    try {
      const head = await LanguageService.getLanguageHead(
        req.app.get('db'),
        req.language.id,
      )
      res.head = head;

      next()
    }
    catch (error) {
      next(error)
    }
  })
  .get(jsonBodyParser, (req, res, next) => {
    try {
      if (!res.head[0])
        return res.status(404).json({
          error: `Cannot find word`,
        })
      return res.json(res.head[0])
    }
    catch (error) {
      next(error)
    }

  });

module.exports = languageRouter;
