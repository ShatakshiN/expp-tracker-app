const Sequelize = require('sequelize');
const sequelize = require('../util/database');
// Order is the model name and order is the table name
const Order = sequelize.define('order' , {
    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    }, 

    paymentId : {
        type : Sequelize.STRING
    },

    orderid : {
        type : Sequelize.STRING
    },

    status : {
        type : Sequelize.STRING
    }



})

module.exports  =Order;
