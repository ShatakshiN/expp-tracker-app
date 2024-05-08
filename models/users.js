const Sequelize = require('sequelize');
const sequelize = require('../util/database')

const Users  = sequelize.define('SignUp',{
    id : {
        type : Sequelize.INTEGER,
        allowNull : false,
        primaryKey : true,
        autoIncrement : true
    },

    name : {
        type : Sequelize.STRING,
        allowNull : false  
    },

    email : {
        type : Sequelize.STRING,
        allowNull : false,
        unique: true
    },

    passWord: {
        type : Sequelize.STRING,
        allowNull :false
        
    },
    
    isPremiumUser : {
        type : Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Users;