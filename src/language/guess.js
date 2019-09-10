/* Again, the integration tests have already been written in the file /test/language-endpoints.spec.js. The skipped tests are inside the describe block for POST /api/language/guess.

Unskip each tests to see it fail. Then, write the implementation for the POST /api/language/guess endpoint which should make the tests pass.

Algorithm requirements
Given a list of questions with corresponding "memory values", M, starting at 1:
Take the first question in the list
Ask the question
If the answer was correct:
Double the value of M
Else, if the answer was wrong:
Reset M to 1
Move the question back M places in the list
Use a singly linked list to do this
Tasks
This is a protected endpoint.
Validate the request body has required field(s).
Write a linked list class implementation to use within this endpoint.
Write service object method(s) for populating the linked list with words from the database.
Check if the submitted answer is correct by comparing it with the translation in the database.
Set the word's new memory value as appropriate according to the algorithm.
Update the incorrect count or correct count for that word.
Update the total score if appropriate.
Shift the word along the linked list the appropriate amount of spaces.
Persist the updated words and language in the database.
Send a response with the fields for feedback about the user's guess as well as the next word to guess. You can find an example of the responses in the front-end code:
/spaced-repetition/cypress/fixtures/language-guess-correct.json
/spaced-repetition/cypress/fixtures/language-guess-incorrect.json
Once you've completed the steps, the integration test should pass. */