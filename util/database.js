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

require('dotenv').config();

const Sequelize = require('sequelize')
const sequelize = new Sequelize(process.env2.DBASE_NAME,process.env2.DBASE_USERNAME, process.env2.DBASE_PASSWORD ,{dialect : 'mysql', host :process.env2.DBASE_HOST}) // instance of Sequelize

module.exports= sequelize;
