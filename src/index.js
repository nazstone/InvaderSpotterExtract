const { getDb, run, close, insertItem } = require('./sqlite');
const { read, listFile } = require('./file');
const { fetchDataFromWebSite } = require('./crawler');

const start = async () => {
  try {
    console.log('starting');
    // init db
    await getDb('./invaders.sqlite3');

    console.log('running sql');
    const sqlPath = './sql/';
    const files = listFile(sqlPath);
    for (let i = 0; i < files.length; i += 1) {
      const sql = read(`${sqlPath}/${files[i]}`);
      await run(sql);
    }

    console.log('fetching data from website');
    await fetchDataFromWebSite(async (jsons) => {
      console.log('inserting data');
      for (let i = 0; i < jsons.length; i += 1) {
        await insertItem(jsons[i]);
      }
    });

    console.log('ended');
    close();
  } catch (error) {
    console.error('something went wrong', error);
  }
};

start();
