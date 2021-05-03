CREATE TABLE IF NOT EXISTS item_comment (
  id NUMBER PRIMARY KEY,
  author TEXT,
  date TEXT,
  comment TEXT,
  itemid NUMBER,
  FOREIGN KEY(itemid) REFERENCES item(id)
);