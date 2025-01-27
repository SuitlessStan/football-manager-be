const config = {
  port: process.env.PORT || 4000,
  mysql: {
    host: process.env.MYSQL_HOST || "mysql",
    database: process.env.MYSQL_DATABASE || "football-manager",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
  },
  jwtSecret: "be5868177cf4a95a3e95a87351e7e7cd129d5f6c944ceb46808b13046870285420a67ee10160bb0edadd7d01d3f9a5811f29386a89a55ad94831606440f78614"
}

export { config }