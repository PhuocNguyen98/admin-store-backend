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
  searchString,
  conditions,
  joinTable
) {
  try {
    let queryString = `SELECT ${field}, ROW_NUMBER() OVER (ORDER BY ${order_by} ${sort}) AS 'stt' FROM ${tableName}`;
    if (joinTable) {
      queryString += ` ${joinTable}`;
    }
    if (conditions) {
      queryString += ` WHERE ${conditions}`;
      if (searchColumn && searchString) {
        queryString += ` AND ${searchColumn} LIKE '%${searchString}%' `;
      }
    } else {
      if (searchColumn && searchString) {
        queryString += ` WHERE ${searchColumn} LIKE '%${searchString}%' `;
      }
    }

    queryString += ` ORDER BY ${order_by} ${sort} LIMIT ${offset},${limit} `;
    // console.log(queryString);

    const [results] = await pool.query(queryString);
    return results;
  } catch (err) {
    console.log(err);
  }
}

async function getRecordV2({
  fields = "*",
  tableName,
  joinTable,
  order_by = "id",
  sort = "asc",
  limit = config.listPerPage,
  offset = 0,
  searchColumn,
  searchString,
  conditions,
}) {
  try {
    let queryString = `SELECT ${fields}, ROW_NUMBER() OVER (ORDER BY ${order_by} ${sort}) AS 'stt' FROM ${tableName}`;
    if (joinTable) {
      queryString += ` ${joinTable}`;
    }
    if (conditions) {
      queryString += ` WHERE ${conditions}`;
      if (searchColumn && searchString) {
        queryString += ` AND ${searchColumn} LIKE '%${searchString}%' `;
      }
    } else {
      if (searchColumn && searchString) {
        queryString += ` WHERE ${searchColumn} LIKE '%${searchString}%' `;
      }
    }

    queryString += ` ORDER BY ${order_by} ${sort} LIMIT ${offset},${limit} `;
    // console.log(queryString);

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
    console.log(error);
  }
}

async function getAllRecord(field, tableName, conditions) {
  try {
    let queryString = `SELECT ${field} FROM ${tableName}`;
    if (conditions) {
      queryString += ` WHERE ${conditions}`;
    }
    const [results] = await pool.query(queryString);
    return results;
  } catch (error) {
    console.log(err);
  }
}

async function getRecordById(table, value) {
  try {
    let queryString = `SELECT * FROM ${table} WHERE id = ${value}`;
    const [result] = await pool.query(queryString);
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function updateRecordById(table, value, id) {
  try {
    const [results] = await pool.query(
      `UPDATE ${table}  SET ? WHERE id = ${id}`,
      [value]
    );
    return results;
  } catch (error) {
    console.log(error);
  }
}

async function getRoleById(id) {
  try {
    const [results] = await pool.query(
      `SELECT name as role_name FROM staff_role WHERE id = ${id}`
    );
    return results[0].role_name;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  checkRecordExists,
  insertRecord,
  getRoleById,
  getRecord,
  getTotalRecord,
  getRecordById,
  updateRecordById,
  getAllRecord,
  getRecordV2,
};
