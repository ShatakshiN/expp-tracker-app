const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
const auth = require('./middleware/auth')
app.use(express.json());
app.use(cors());

//routes
const userRoute = require('./route/loginAndSignUp');
const expenseRoute = require('./route/expense'); 
const delRoute = require('./route/del');
const premiumRoute = require('./route/premium');

app.use(userRoute);
app.use(expenseRoute);
app.use(delRoute);
app.use(premiumRoute)


// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_LINK)
    .then(() => {
        app.listen(4000, () => {
            console.log('Server running');
        });
    })
    .catch(err => {
        console.error(err.message);
    });
