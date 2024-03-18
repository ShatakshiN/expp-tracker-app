/* const mysql = require('mysql2'); //

const pool = mysql.createPool({ // Creates a connection pool using the createPool method from the mysql2 library. The pool allows for more efficient management of MySQL connections.
    host: 'localhost',
    user: 'root', //of mysql
    database: 'node-complete',
    password: 'Tuktuk123@'

});

module.exports = pool.promise(); 

/* note:-Exports the created pool as a promise-based pool. This allows you to use promises instead of callbacks when interacting with 
the MySQL database.

 */ 

//importing sequelize

const Sequelize = require('sequelize')
const sequelize = new Sequelize('node-complete','root', 'Tuktuk123@',{dialect : 'mysql', host : 'localhost'}) // instance of Sequelize

module.exports= sequelize;