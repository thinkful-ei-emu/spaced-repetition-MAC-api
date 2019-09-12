

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
  // getTotalWords(db) { //inplement count for loop
  //   return db
  //     .from("word")
  //     .count()
  // },

  getLastWord(db, language_id) {
    return db
      .from("word")
      .select(
        "id",
        "original",
        "translation",
        "next",
        "correct_count",
        "incorrect_count",
        "memory_value"
      )
      .where({ next: null, language_id: language_id });
  },

  getNextWord(db, language_id, id) {
    return db
      .from("word")
      .select(
        "id",
        "original",
        "translation",
        "next",
        "correct_count",
        "incorrect_count",
        "memory_value"
      )
      .where({ id: id, language_id: language_id });
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
    await this.updateIncorrectlyAnswered(incorrectlyAnswered, db, language_id);
    await this.updatePlaceholder(
      placeholder,
      db,
      language_id,
      incorrectlyAnswered
    );
    

    await this.updateHeadWord(newHead, db, language_id);
    

    await this.updateHead(newHead, db, language_id);
    

    return "update head complete";
  },
  updateHead(newHead, db, language_id) {
    return db
      .from("language")
      .where("id", language_id)
      .update("head", newHead.id);
  },
  updateHeadWord(newHead, db, language_id) {
    return db
      .from("word")
      .where({ "id": newHead.id, "language_id": language_id })
      .update("next", newHead.next);
  },
  updateIncorrectlyAnswered(incorrect, db, language_id) {
    // return db.raw(
    //   `UPDATE word SET incorrect_count = ${incorrect.incorrect_count}, memory_value = ${incorrect.memory_value}, next = ${incorrect.next} FROM language WHERE word.language_id = language.id AND language.id = ${language_id} AND word.id = ${incorrect.id}`
    // );
    return db
      .from("word")
      .where({ language_id: language_id, id: incorrect.id })
      .update({
        "incorrect_count": incorrect.incorrect_count,
        "memory_value": incorrect.memory_value,
        "next": incorrect.next
      });
  },
  updatePlaceholder(placeholder, db, language_id, incorrectlyAnswered) {
    // return db.raw(
    //   `UPDATE word SET next = ${placeholder.next} FROM language WHERE word.language_id = language.id AND language.id = ${language_id} AND word.id = ${placeholder.id}`
    // )    console.log('INCORECT UPDATE')

    return db
      .from("word")
      .where({ "language_id": language_id, "id": placeholder.id })
      .update({ "next": incorrectlyAnswered.id });
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
      .from("language")
      .join("word", "word.id", "language.head")
      .select(
        "word.original AS nextWord",
        "language.total_score AS totalScore",
        "word.correct_count AS wordCorrectCount",
        "word.incorrect_count AS wordIncorrectCount"
      )
      .where("language.id", language_id)
  },
  //if head value equals user's guess:
  async rightAnswer(newHead, correctlyAnswered, insertAfter, db, language_id) {
    await this.updateHeadWord(newHead, db, language_id);
    await this.updatePlaceholder(
      insertAfter,
      db,
      language_id,
      correctlyAnswered
    );
    await this.updateCorrectlyAnswered(correctlyAnswered, db, language_id);
    await this.updateTotalScore(correctlyAnswered, db, language_id);
    await this.updateHead(newHead, db, language_id);
    return "updated";
  },
  updateCorrectlyAnswered(correct, db, language_id) {
    return db
      .from("word")
      .where({ "language_id": language_id, "id": correct.id })
      .update({
        "correct_count": correct.correct_count,
        "memory_value": correct.memory_value,
        "next": correct.next
      });
  },
  updateTotalScore(correct, db, language_id) {
    return db
      .from("language")
      .where("id", language_id)
      .update({
        "total_score": correct.total_score
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
