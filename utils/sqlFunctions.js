const mysql = require("mysql2/promise");
const config = require("../db/config");
const helper = require("./helper");
const pool = mysql.createPool(config);

async function checkRecordExists(tableName, column, value) {
  try {
    const [results] = await pool.query(
      `SELECT * FROM ${tableName} WHERE ${column} = ?`,
      [value]
    );
    return results.length ? results[0] : null;
  } catch (err) {
    console.log(err);
  }
}

async function insertRecord(tableName, record) {
  try {
    const [results] = await pool.query(`INSERT INTO ${tableName} SET ?`, [
      record,
    ]);
    return results;
  } catch (err) {
    console.log(err);
  }
}

async function getRole(roleId) {
  try {
    const [results] = await pool.query(
      `SELECT name as role_name FROM staff_role WHERE id = ${roleId}`
    );
    return results[0].role_name;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  checkRecordExists,
  insertRecord,
  getRole,
};
