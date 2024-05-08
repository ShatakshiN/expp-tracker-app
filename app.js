const http = require('http');
const express = require('express');
const app  = express();
const cors = require('cors');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
// Import dotenv and configure to load environment variables
require('dotenv').config();




//models
const Users = require('./models/users');
const Expense = require('./models/expense');
const Order = require('./models/order');
const { error } = require('console');
const { where } = require('sequelize');


app.use(bodyParser.json());
app.use(cors());

function isStrValid(str){
    if(str == undefined || str.length === 0){
        return true
    }else{
        return false
    }
}

app.post('/signUp', async(req,res,next)=>{
    try{
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        if (isStrValid(email)|| isStrValid(name) || isStrValid(password) ){
            return res.status(400).json({err : "bad parameter"})

        }

         // Check if the email already exists
        const existingUser = await Users.findOne({
            where: {
                email: email,
            }
        });

        if (existingUser) {
            return res.status(400).json({message : "user already exists"})
        } 

        bcrypt.hash(password, 10, async(error, hash)=>{
            const userData = await Users.create({
                name : name,
                email : email,
                passWord : hash,
             

            })

        })
        return res.status(201).json({msg: "sign up successful"})

       

    }catch(error){
        return res.status(500).json({error : error.message})
    }

});

function generateAccessToken(id){
    return jwt.sign({userId: id }, 'secret key')
}

app.post('/login', async (req, res, next) => {
    try {
        
        const email = req.body.email;
        const password = req.body.password;
       

        if(isStrValid(email) || isStrValid(password)){
            return req.status(400).json({message : "bad parameters"})
        }

        const loginCredentials = await Users.findAll({
            where: { email: email }
        });

        if(loginCredentials.length > 0){
            bcrypt.compare(password, loginCredentials[0].passWord, (err, result )=>{ //the result will be true / false
                if(err){
                    res.status(500).json({msg : "something went wrong"})
                }
                if(result === true){
                    res.status(200).json({msg: "user logged in successfully", token: generateAccessToken(loginCredentials[0].id) })
                }else {
                    return res.status(400).json({ msg: 'password incorrect' });
                }
            })
        }else {
            return res.status(404).json({ msg: "user doesn't exist" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

async function authenticate(req,res,next) {
    /* try{
        const token = req.header('Authorization');
        console.log(token);
        if (!token) {
            throw new Error('Authorization token missing');
        }
        const user = jwt.verify(token, 'secret key');
        console.log(user.userId)
        Users.findByPk(user.userId).then(user =>{
            console.log(JSON.stringify(user));
            req.user = user; // for global use
            next();
        }).catch(err =>{throw new Error(err)})
    }catch(err){
        console.log(err);
        return res.status(401).json({sucess : false})
    } */
    try {
        const token = req.header('Authorization');
        console.log(token);
        
        if (!token) {
            throw new Error('Authorization token missing');
        }
        
        const user = jwt.verify(token, 'secret key');
        console.log(user.userId);

        const foundUser = await Users.findByPk(user.userId); // Wait for the user lookup
        if (!foundUser) {
            throw new Error('User not found'); // Handle if user is not found
        }

        console.log(JSON.stringify(foundUser));
        req.user = foundUser; // Assign the user to the request for global use
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false });
    }

} 



app.post('/daily-expense', authenticate, async(req,res,next)=>{

    try{
        const description = req.body.description;
        const amount = req.body.amount;
        const date = req.body.date;
        const category = req.body.category;
        const id = req.body.userId;

        const expenseData = await Expense.create({
            date : date,
            description: description,
            amount : amount,
            category : category,
            SignUpId : req.user.id

                     
        })
        //await Expense.setUsers(userData)

        res.status(201).json({expense:expenseData})       

    }
    catch(error){
        res.status(500),json({message : error})
    }
})



app.get('/daily-expense',authenticate,async(req,res,next) =>{
    const userId = req.user.id;
    try{
        const users = await Expense.findAll({where : {SignUpId : userId}});
        res.status(200).json({allUserOnScreen : users})
    }catch(error){
        res.status(500).json({error : error.message})
    };

});

app.delete('/delete-expense/:userId', async(req,res,next)=>{

    const userId = req.params.userId

    try{
        const user = await Expense.findByPk(userId);
        if (!user){
            throw new Error('userId not found');
        }

        await user.destroy();
        res.status(200).json({error : 'user deleted successfully'})

    }catch(error){

        res.status(500).json({error  : error.message})
       
    }

});

//purchase premium 
app.get('/buy-premium', authenticate,async(req,res,next)=>{
    try {
        const rzp = new Razorpay({
            key_id: 'rzp_test_Q2HptqFSrHvQyN',
            key_secret:'3QSDfkuXQm9lCkhK6mGcgmf8'
        });

        const amount = 149.00;

        // Create order asynchronously using await
        const order = await new Promise((resolve, reject) => {
            rzp.orders.create({ amount, currency: 'INR' }, (err, order) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });
        
        // Associate the order with the user
        await req.user.createOrder({ orderid: order.id, status: "PENDING" });

        // Send success response
        return res.status(201).json({ order, key_id: rzp.key_id });
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err.message });
    }
    
});



app.post('/updatetransectionstatus', authenticate, async (req, res, next) => {
    try {
        const { payment_id, order_id } = req.body;

        // Find the order
        const orderPromise = Order.findOne({ where: { orderid: order_id } });

        // Update the user to premium
        const userUpdatePromise = req.user.update({ isPremiumUser: true });

        // Wait for both promises to resolve using Promise.all
        const [order, user] = await Promise.all([orderPromise, userUpdatePromise]);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Update the order status
        await order.update({ paymentId: payment_id, status: 'successful' });

        // Respond with success message
        res.status(202).json({ success: true, message: 'Transaction successful' });
    } catch (err) {
        next(err); // Forward error to the error handling middleware
    }
});

/* app.get('/check-premium-status', authenticate, async (req, res, next) => {
    
}); */



Expense.belongsTo(Users,{constraints: true, onDelete: 'CASCADE'});
Users.hasMany(Expense);

Order.belongsTo(Users, {constraints: true, onDelete: 'CASCADE'});
Users.hasMany(Order); 

sequelize.sync()
    .then(()=>{
        app.listen(4000)
        console.log('server is running on 4000')

    })
    .catch((error)=>{
        console.log(error);
    });