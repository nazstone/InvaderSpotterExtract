const { getDb, run, close, insertItem } = require('./sqlite');
const { read, listFile } = require('./file');
const { fetchDataFromWebSite } = require('./crawler');

const start = async () => {
  // init db
  await getDb('./invaders.sqlite3');

  const sqlPath = './sql/';
  const files = listFile(sqlPath);
  for (let i = 0; i < files.length; i += 1) {
    const sql = read(`${sqlPath}/${files[i]}`);
    await run(sql);
  }

  await fetchDataFromWebSite(async (jsons) => {
    for (let i = 0; i < jsons.length; i += 1) {
      await insertItem(jsons[i]);
    }
  });

  close();
};

start();
