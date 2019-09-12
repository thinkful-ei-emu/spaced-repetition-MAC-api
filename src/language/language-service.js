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
      .whereNull("next")
      .andWhere({language_id});
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
    console.log('update newhead ran')
    return db
      .from("language")
      .where("id", language_id)
      .update("head", newHead.id);
  },
  updateHeadWord(newHead, db, language_id) {
    console.log('update head word ran')
    return db
      .from("word")
      .where({ "id": newHead.id, "language_id": language_id })
      .update("next", newHead.next);
  },
  //`UPDATE word SET incorrect_count = ${incorrect.incorrect_count}, memory_value = ${incorrect.memory_value}, next = ${incorrect.next} FROM language WHERE word.language_id = language.id AND language.id = ${language_id} AND word.id = ${incorrect.id}`
  updateIncorrectlyAnswered(incorrect, db, language_id) {  
    return db
      .from("word")
      .where({ language_id: language_id, id: incorrect.id })
      .update({
        "incorrect_count": incorrect.incorrect_count,
        "memory_value": incorrect.memory_value,
        "next": incorrect.next
      });
  },
  //`UPDATE word SET next = ${placeholder.next} FROM language WHERE word.language_id = language.id AND language.id = ${language_id} AND word.id = ${placeholder.id}`
  updatePlaceholder(placeholder, db, language_id, incorrectlyAnswered) {
    return db
      .from("word")
      .where({ "language_id": language_id, "id": placeholder.id })
      .update({ "next": incorrectlyAnswered.id });
  },

  //UPDATE word SET memory_value = 1 FROM language WHERE language.id = word.language_id AND word.translation ILIKE '%coffee%';

  //SELECT language.head, word.translation FROM language JOIN word on language.id = word.language_id WHERE word.id = language.head;

  //UPDATE language SET head = word.next FROM word WHERE language.id = word.language_id AND word.id = language.id;
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
    await this.updatePlaceholder(insertAfter, db, language_id, correctlyAnswered);
    await this.updateTotalScore(correctlyAnswered, db, language_id);
    await this.updateHead(newHead, db, language_id);
    return "updated";
  },
  updateCorrectlyAnswered(correct, db, language_id) {
    console.log('update correctly answered ran')
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

  
};

module.exports = LanguageService;
