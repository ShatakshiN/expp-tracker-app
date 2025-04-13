const mongoose = require("mongoose");
const { NUMBER } = require("sequelize");
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: Number,
        required: true
    },
    userId: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

})

module.exports = mongoose.model('Expense', expenseSchema)
