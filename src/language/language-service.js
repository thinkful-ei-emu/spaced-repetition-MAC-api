const LinkedList = require("../middleware/linkedList");

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from("word")
      .select(
        "id",
        "language_id",
        "original",
        "translation",
        "next",
        "memory_value",
        "correct_count",
        "incorrect_count"
      )
      .where({ language_id });
  },

  getAnswer(db, language_head) {
    return db
      .from("word")
      .join("language", "word.id", "language.head")
      .select(
        "word.id",
        "word.original",
        "word.translation",
        "word.next",
        "language.total_score",
        "word.correct_count",
        "word.incorrect_count",
        "word.memory_value"
      );
  },
  async wrongAnswer(
    newHead,
    incorrectlyAnswered,
    placeholder,
    db,
    language_id
  ) {
    let output = await this.updateHead(newHead, db, language_id);
    console.log("HEAD UPDATED", output);
    output = await this.updateIncorrectlyAnswered(
      incorrectlyAnswered,
      db,
      language_id
    );
    output = await this.updatePlaceholder(placeholder, db, language_id);
    return output;
  },
  updateHead(newHead, db, language_id) {
    return db
      .from("language")
      .where("id", language_id)
      .update("head", newHead[0].id);
  },
  updateIncorrectlyAnswered(incorrect, db, language_id) {
    return db.raw(
      `UPDATE word SET incorrect_count = ${incorrect.incorrect_count}, memory_value = ${incorrect.memory_value}, next = ${incorrect.next} FROM language WHERE word.language_id = language.id AND language.id = ${language_id} AND word.id = ${incorrect.id}`
    );
    /* 
    return db
    .from('word')
    .join('language', 'language.id', 'word.language_id')
    .where({'language.id': language_id, 'word.id': incorrect.id})
    .update({'word.incorrect_count': incorrect.incorrect_count, 'word.memory_value': incorrect.memory_value, 'word.next': incorrect.next})
  */
  },
  updatePlaceholder(placeholder, db, language_id) {
    console.log('PLACEHOLDER', placeholder)
    return db.raw(
      `UPDATE word SET next = ${placeholder.next} FROM language WHERE word.language_id = language.id AND language.id = ${language_id} AND word.id = ${placeholder.id}`
    )
    /* return db
      .from("word")
      .join("language", "word.language_id", "language.id")
      .where({ "language.id": language_id, "word.id": placeholder.id })
      .update({ "word.next": placeholder.next }); */
  },

  /*  
       LanguageService.wrongAnswer(
        newHead,
        incorrectlyAnswered,
        placeholder,
        req.app.get("db"),
        req.language.id
      ); populateLinkedList(words){
    let list = new LinkedList()
    list.insertFirst(words[0])
    for(let i =1; i < words.length-1; i++){
      list.insertLast(words[i].translation)
    }
    console.log('LIST', list)
    return list
  }, */
  /*  getAnswer(guess, db, language_id){
   return db
   .from('word')
   .join('language', 'word.id', 'word.language_id')
   .select(
     'word.id',
     'word.next',
     'language.total_score',
     'word.correct_count',
     'word.incorrect_count',
     'word.translation',
     'word.memory_value'
   )
   .where({'word.translation': guess, 'language.id':language_id})
   }, */
  getLanguageHead(db, language_id) {
    return db
      .from('word')
      .join('language', 'word.language_id', 'language.id')
      .select(
        'word.original AS nextWord',
        'language.total_score AS totalScore',  
        'word.correct_count AS wordCorrectCount',
        'word.incorrect_count AS wordIncorrectCount'          
        
      ).where({ language_id });    
      },
  //if head value equals user's guess:
  rightAnswer(newHead, correctlyAnswered, insertAfter, db, language_id) {
    console.log("RIGHT ANSWER IS RUNNING");
    this.updateHead(newHead, db, language_id);
    this.updatePlaceholder(insertAfter, db, language_id);
    this.updateCorrectlyAnswered(correctlyAnswered, db, language_id);
    return "updated";
  },
  updateCorrectlyAnswered(correct, db, language_id) {
    return db
      .from("word")
      .join("language", "word.language_id", "language.id")
      .where({ "language.id": language_id, "word.id": correct.id })
      .update({
        "word.correct_count": correct.correct_count,
        "word.memory_value": correct.memory_value,
        "word.next": correct.next,
        "language.total_score": correct.total_score
      });
  }
  /*  
Set the word's new memory value as appropriate according to the algorithm.
Update the incorrect count or correct count for that word.
Update the total score if appropriate.
Shift the word along the linked list the appropriate amount of spaces.
Persist the updated words and language in the database.
Send a response with the fields for feedback about the user's guess as well as the next word to guess. You can find an example of the responses in the front-end code:
/spaced-repetition/cypress/fixtures/language-guess-correct.json
/spaced-repetition/cypress/fixtures/language-guess-incorrect.json
Once you've completed the steps, the integration test should pass. */
  //store head value and update memory value
  //UPDATE word SET memory_value = 1 FROM language WHERE language.id = word.language_id AND word.translation ILIKE '%coffee%';

  //SELECT language.head, word.translation FROM language JOIN word on language.id = word.language_id WHERE word.id = language.head;

  //UPDATE language SET head = word.next FROM word WHERE language.id = word.language_id AND word.id = language.id;

  /* correctAnswer.memory_value = correctAnswer.memory_value *2 
      console.log('MEMORY VALUE', correctAnswer.memory_value)
      //reset head
      list.head = list.head.next
      //move correctAnswer to memoryValue spot in list
      list.insertAt(correctAnswer, correctAnswer.memory_value)
      console.log('AFTER CORRECT', list)
      //return correctAnswer
 */
  /*   return db 
      .from('word')
      .join('')

      
    }
    //if answer is incorrect: 
    if(answer !== guess){
      let incorrectAnswer = list.head.value
      list.head = list.head.next
      incorrectAnswer.memory_value = 1
      list.insertAt(incorrectAnswer, incorrectAnswer.memory_value)
      console.log('AFTER INCORRECT', list)
   return correctAnswer */
};

module.exports = LanguageService;
