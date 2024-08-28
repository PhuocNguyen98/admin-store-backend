const mysql = require("mysql2/promise");
const config = require("../db/config");
const helper = require("./helper");
const pool = mysql.createPool(config.db);

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

async function getRecord(
  field = "*",
  tableName,
  order_by = "id",
  sort = "asc",
  limit = config.listPerPage,
  offset = 0,
  searchColumn,
  searchString
) {
  try {
    let queryString = `SELECT ${field} FROM ${tableName}`;
    if (searchColumn && searchString) {
      queryString += ` WHERE ${searchColumn} LIKE '%${searchString}%' `;
    }
    queryString += ` ORDER BY ${order_by} ${sort} LIMIT ${offset},${limit} `;

    const [results] = await pool.query(queryString);
    return results;
  } catch (err) {
    console.log(err);
  }
}

async function getTotalRecord(table, column, value) {
  try {
    let queryString = `SELECT COUNT(*) AS totalRecord FROM ${table}`;
    if (column && value) {
      queryString += ` WHERE ${column} LIKE '%${value}%'`;
    }

    const [result] = await pool.query(queryString);
    return result[0].totalRecord;
  } catch (error) {
    console.lof(error);
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
  getRecord,
  getTotalRecord,
};
