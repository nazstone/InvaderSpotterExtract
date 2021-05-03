const sqlite3 = require('sqlite3').verbose();

let db;

const get = async (query) => {
  return new Promise((res, rej) =>
    db.get(query, function (err, row) {
      if (err) {
        return rej(err);
      }
      res(row);
    })
  );
};

const run = async (query) => {
  return new Promise((res, rej) =>
    db.run(query, function (err, row) {
      if (err) {
        return rej(err);
      }
      res(row);
    })
  );
};

const all = async (query) => {
  return new Promise((res, rej) =>
    db.all(query, function (err, all) {
      if (err) {
        return rej(err);
      }
      res(all);
    })
  );
};

const stmtRun = async (stmt, data) => {
  return new Promise((res, rej) => {
    stmt.run(data, (err) => {
      if (err) {
        return rej(err);
      }
      return res();
    });
  });
};

const stmtFinalize = async (stmt) => {
  return new Promise((res, rej) => {
    stmt.finalize((err) => {
      if (err) {
        return rej(err);
      }
      return res();
    });
  });
};

const getDb = async (path) => {
  try {
    db = new sqlite3.Database(path);
    return db;
  } catch (error) {
    console.error('err1', error);
  }
};

const insertItem = async (data) => {
  try {
    const { rowid } = await get('select max(rowid) as rowid from item');
    const stmt = await db.prepare(
      'INSERT INTO item (id, name, points, city, status, date, image_main, image_street, image_street_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    await stmtRun(stmt, [
      rowid + 1,
      data.metadata.name,
      data.metadata.points,
      data.metadata.city,
      data.metadata.status,
      data.metadata.date,
      data.image.main,
      data.image.street,
      data.image.streetUpdated,
    ]);
    await stmtFinalize(stmt);

    if (data.comments && data.comments.length > 0) {
      const stmt = await db.prepare(
        'INSERT INTO item_comment (author, date, comment, itemid) VALUES (?, ?, ?, ?)'
      );
      for (let i = 0; i < data.comments.length; i += 1) {
        await stmtRun(stmt, [
          data.comments[i].author,
          data.comments[i].date,
          data.comments[i].comment,
          rowid + 1,
        ]);
      }
      await stmtFinalize(stmt);
    }
  } catch (error) {
    console.error(error);
  }
};

const close = () => {
  db.close();
};

module.exports = {
  all,
  insertItem,
  get,
  stmtFinalize,
  stmtRun,
  run,
  close,
  getDb,
};
