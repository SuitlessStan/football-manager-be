module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: "mysql",
      database: "football-manager",
      user: "root",
      password: "root",
    }
  },
  test: {
    client: "mysql2",
    connection: {
      host: "mysql",
      database: "football-manager-test",
      user: "root",
      password: "root",
    }
  },
};