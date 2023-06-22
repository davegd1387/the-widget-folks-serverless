require("dotenv").config();

const Pool = require("pg").Pool;
const pool = new Pool();

module.exports = pool;
