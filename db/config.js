const config = {
  db: {
    host: process.env.HOST,
    port: process.env.PORT_DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  },
  listPerPage: 2,
};

module.exports = config;
