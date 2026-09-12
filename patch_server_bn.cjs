const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(
  'current_turn.text += ` ${w.punctuated_word}`;',
  'current_turn.text += ` ${w.punctuated_word || w.word}`;'
);

content = content.replace(
  'text: w.punctuated_word,',
  'text: w.punctuated_word || w.word,'
);

fs.writeFileSync('server.ts', content);
