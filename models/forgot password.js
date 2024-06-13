const Sequelize= require('sequelize');
const sequelize= require('../util/database');
const resetPassword = sequelize.define('resetPassword',{
    id :{
        type : Sequelize.UUID,
        defaultValue : Sequelize.UUIDV4,
        primaryKey : true
    },
    isActive : {
        type : Sequelize.BOOLEAN,
        defaultValue : true
    }
})

module.exports = resetPassword;