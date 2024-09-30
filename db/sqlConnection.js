const mysql = require("mysql2");
const config = require("./config");

let db_con = mysql.createConnection(config.db);

db_con.connect((err) => {
  if (err) {
    console.log("Database Connection Failed !!!", err);
  } else {
    console.log("connected to Database");
  }
});

module.exports = db_con;
