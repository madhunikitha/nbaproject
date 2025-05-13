const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Access the variables
const host = process.env.host;
const user = process.env.user;
const password = process.env.password;
const database = process.env.database;
const dbport=process.env.dbport;

const app = express();
app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database: database
});

app.get('/authors', (req, res) => {
  db.query('SELECT DISTINCT Author_ID1 FROM publicationdb UNION SELECT DISTINCT Author_ID2 FROM publicationdb UNION SELECT DISTINCT Author_ID3 FROM publicationdb UNION SELECT DISTINCT Author_ID4 FROM publicationdb UNION SELECT DISTINCT Author_ID5 FROM publicationdb UNION SELECT DISTINCT Author_ID6 FROM publicationdb UNION SELECT DISTINCT Author_ID7 FROM publicationdb', (err, results) => {
    if (err) {
      console.error('Error fetching authors:', err);
      res.status(500).send('Server error');
      return;
    }
    const authors = results.map(row => Object.values(row)[0]);
    res.json(authors);
  });
});


app.post('/search', (req, res) => {
  const { author, fromYear, toYear, indexing,circulation,
    dept} = req.body;
  console.log(author, fromYear, toYear, indexing,circulation,
    dept);

  let query = 'SELECT * FROM publicationdb';
  const queryParams = [];
  const conditions = [];

  if (author) {
    const authorConditions = [];
    for (let i = 1; i <= 7; i++) {
      authorConditions.push(`Author_ID${i} LIKE ?`);
      queryParams.push(`%${author}%`);
    }
    conditions.push(`(${authorConditions.join(' OR ')})`);
  }

  if (fromYear && toYear) {
    conditions.push('dateOfPublication BETWEEN ? AND ?');
    queryParams.push(`${fromYear}-07-01`, `${toYear}-06-30`);
  } else if (fromYear) {
    conditions.push('dateOfPublication >= ?');
    queryParams.push(`${fromYear}-07-01`);
  } else if (toYear) {
    conditions.push('dateOfPublication <= ?');
    queryParams.push(`${toYear}-06-30`);
  }

  if (indexing && indexing !== 'all') {
    conditions.push(`${indexing} = ?`);
    queryParams.push('yes');
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  if (circulation && circulation !== 'all') {
    if (circulation === 'both') {
      query += " AND (levelOfCirculation = 'National' OR levelOfCirculation = 'International')";
    } else {
      query += ` AND levelOfCirculation = '${circulation}'`;
    }
  }


  if (dept && dept !== 'all') {
    query += ' AND dept = ?';
    queryParams.push(dept);
    console.log(dept)
  }
  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Server error');
      return;
    }
    console.log('Query results:', results);
    res.json(results);
  });
});

app.listen(dbport, () => {
  console.log("listening on port dbport");
});