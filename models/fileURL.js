const Sequelize= require('sequelize');
const sequelize= require('../util/database');
const FileURL = sequelize.define('fileURL',{
    id : {
        type : Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey : true
    }, 

    url : {
        type : Sequelize.STRING
    }

});

module.exports = FileURL;