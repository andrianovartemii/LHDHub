const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "usersdb2",
  password: "123456"
});

function test(){
console.log('test');
}
const sql = `INSERT INTO users(name, age) VALUES('Sam', 31)`;

connection.query(sql, function(err, results) {
    if(err) console.log(err);
    console.log(results);
});

connection.end();
