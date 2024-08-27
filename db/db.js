const mysql = require("mysql2");
const config = require("./config");

async function query(sql, pramas) {
  try {
    const pool = await mysql.createPool(config.db);
    const [results] = pool.execute(sql, pramas);
    return results;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  query,
};
