const fs = require('fs');

const read = (filepath) => {
  const buffer = fs.readFileSync(filepath);
  const fileContent = buffer.toString();
  return fileContent;
};

const extractIndex = (filename) => {
  return filename.split('_')[0];
};

const listFile = (filepath) => {
  const files = fs.readdirSync(filepath);
  return files
    .filter((f) => f.match(/[0-9]+_.*\.sql/))
    .sort((a, b) => extractIndex(a) - extractIndex(b));
};

module.exports = {
  read,
  listFile,
};
