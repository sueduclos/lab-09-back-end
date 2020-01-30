DROP TABLE explorer, weather, eventful;

CREATE TABLE IF NOT EXISTS explorer (
  id SERIAL PRIMARY KEY,
  city VARCHAR(255),
  formattedquery VARCHAR(255),
  lat NUMERIC(10, 7),
  long NUMERIC(10, 7)
);

CREATE TABLE IF NOT EXISTS weather (
    id SERIAL PRIMARY KEY,
    forecast VARCHAR(255),
    time VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS eventful (
    id SERIAL PRIMARY KEY,
    link VARCHAR(255),
    date VARCHAR(255),
    summary VARCHAR(255)
);

-- set up db client, connect to the right - 