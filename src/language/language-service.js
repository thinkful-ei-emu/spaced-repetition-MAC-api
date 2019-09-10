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
  getLanguageWordsTwo(db, language_id){
    return db
      .from('word')
      .join('language', 'word.language_id', 'language.id')
      .select(
        'word.original',
        'language.total_score',
        'word.correct_count',
        'word.incorrect_count'
      )
      .where({ language_id });
  },
  getWordsLinkedList(words){
    let list = new LinkedList();
    list.insertFirst(words[0]);
    let i = words.length-1;
    while(i > 0){
      list.insertLast(words[i]);
      i--;
    }
    return list;
  },
  getLanguageHead(words){
    let list = new LinkedList();
    list.insertFirst(words[0]);
    let i = words.length-1;
    while(i > 0){
      list.insertLast(words[i]);
      i--;
    }
    return list.head;
  }
};

module.exports = LanguageService;
