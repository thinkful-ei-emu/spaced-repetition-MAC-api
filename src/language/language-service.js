const LinkedList = require('../middleware/linkedList');

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score'
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count'
      )
      .where({ language_id });
  },

  getLanguageHead(db, language_head) {
    return db
      .from('word')
      .join('language', 'word.id', 'language.head')
      .select(
        'word.id',
        'word.original',
        'language.total_score',
        'word.correct_count',
        'word.incorrect_count'
      );

  },

/*   populateLinkedList(words){
    let list = new LinkedList()
    list.insertFirst(words[0])
    for(let i =1; i < words.length-1; i++){
      list.insertLast(words[i].translation)
    }
    console.log('LIST', list)
    return list
  }, */
  getAnswer(guess, db, language_id){
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
   },
  
   //if head value equals user's guess:
   rightAnswer(){

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
