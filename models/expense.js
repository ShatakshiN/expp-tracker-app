const Sequelize = require('sequelize');
const sequelize = require('../util/database')

const Expense = sequelize.define('expense',{
    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        primaryKey : true,
        autoIncrement : true
    },
    date :{
        type : Sequelize.DATEONLY,
        allowNull: false
    },
    description :{
        type : Sequelize.STRING,
        allowNull: false
    },
    amount :{
        type : Sequelize.DOUBLE,
        allowNull: false
    },
    category : {
        type : Sequelize.INTEGER,
        allowNull: false
    }
});
module.exports = Expense;