// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "root123",
//   database: "messenger"
// });

// db.connect((err) => {
//   if (err) console.log(err);
//   else console.log("MySQL Connected");
// });

// module.exports = db;

// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: process.env.MYSQLHOST,
//   user: process.env.MYSQLUSER,
//   password: process.env.MYSQLPASSWORD,
//   database: process.env.MYSQLDATABASE,
//   port: process.env.MYSQLPORT
// });

// db.connect((err) => {
//   if (err) {
//     console.log("DB ERROR:", err);
//   } else {
//     console.log("✅ MySQL Connected");
//   }
// });

// module.exports = db;const mysql = require("mysql2");
const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log("DB ERROR:", err);
  } else {
    console.log("MySQL Connected Successfully");
  }
});

module.exports = db;