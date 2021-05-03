CREATE TABLE IF NOT EXISTS item (
  id NUMBER PRIMARY KEY,
  name TEXT,
  points NUMERIC,
  city TEXT,
  status TEXT,
  date TEXT,
  image_main TEXT,
  image_street TEXT,
  image_street_updated TEXT
);