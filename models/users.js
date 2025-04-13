const mongoose  = require("mongoose");
const Schema = mongoose.Schema;

const userSchema  = new Schema({
    name:{
        type : String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true 
    },
    password:{
        type : String,
        required : true
    },
    isPremiumUser: {
        type: Boolean,
        default: false
    }
});

userSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'user'
});

module.exports = mongoose.model('User', userSchema)

