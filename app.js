const http = require('http');
const express = require('express');
const fs = require('fs');
const nativePath = require('path')
const customPath = require('./util/customPath')
const app  = express();
const cors = require('cors');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');


const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
//const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');


//const Brevo = require('@getbrevo/brevo');
var Brevo = require('@getbrevo/brevo');

//const aws = require('aws-sdk');
const favicon = require('serve-favicon');

//adds security to headers
//const helmet = require('helmet');

//morgan for logging 
//const morgan = require('morgan');

// Import dotenv and configure to load environment variables
require('dotenv').config();


//models
const Users = require('./models/users');
const Expense = require('./models/expense');
const Order = require('./models/order');
const resetPassword  = require('./models/forgot password');
const FileURL = require('./models/fileURL');
const { error, group } = require('console');
const { where } = require('sequelize');
const { Stream } = require('stream');


const accessLogStream = fs.createWriteStream(nativePath.join(__dirname, 'access.log'),{flag :'a'});

app.use(bodyParser.json());


app.use(cors());

/* app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "https://cdn.jsdelivr.net"], 
            
        },
    },
}));
app.use(morgan('combined', { stream: accessLogStream })); */

app.get('/favicon.ico', (req, res) => res.status(204));
function isStrValid(str) {
    return (str === undefined || str.length === 0);
}

app.post('/signUp', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        console.log('backend', { name, email, password });

        if (isStrValid(email) || isStrValid(name) || isStrValid(password)) {
            return res.status(400).json({ err: "bad parameter" });
        }

        // Check if the email already exists
        const existingUser = await Users.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "user already exists" });
        }

        bcrypt.hash(password, 10, async (error, hash) => {
            await Users.create({ name, email, passWord: hash });
        });

        return res.status(201).json({ msg: "sign up successful" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

function generateAccessToken(id) {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET);
}

app.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (isStrValid(email) || isStrValid(password)) {
            return res.status(400).json({ message: "bad parameters" });
        }

        const loginCredentials = await Users.findAll({ where: { email } });

        if (loginCredentials.length > 0) {
            bcrypt.compare(password, loginCredentials[0].passWord, (err, result) => {
                if (err) {
                    res.status(500).json({ msg: "something went wrong" });
                }
                if (result === true) {
                    res.status(200).json({ msg: "user logged in successfully", token: generateAccessToken(loginCredentials[0].id) });
                } else {
                    return res.status(400).json({ msg: 'password incorrect' });
                }
            });
        } else {
            return res.status(404).json({ msg: "user doesn't exist" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

async function authenticate(req, res, next) {
    try {
        const token = req.header('Authorization');
        console.log(token);

        if (!token) {
            throw new Error('Authorization token missing');
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log(user.userId);

        const foundUser = await Users.findByPk(user.userId);
        if (!foundUser) {
            throw new Error('User not found');
        }

        req.user = foundUser;
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false });
    }
}

app.post('/daily-expense', authenticate, async (req, res, next) => {
    try {
        const { description, amount, date, category } = req.body;

        const expenseData = await Expense.create({
            date,
            description,
            amount,
            category,
            SignUpId: req.user.id
        });

        res.status(201).json({ expense: expenseData });
    } catch (error) {
        res.status(500).json({ message: error });
    }
});

app.get('/daily-expense', authenticate, async (req, res, next) => {
    try {
        const users = await Expense.findAll({ where: { SignUpId: req.user.id } });
        res.status(200).json({ allUserOnScreen: users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/delete-expense/:expenseId', authenticate, async (req, res, next) => {
    try {
        const expenseId = req.params.expenseId;

        const expenseToDelete = await Expense.findOne({
            where: {
                id: expenseId,
                SignUpId: req.user.id
            }
        });

        if (!expenseToDelete) {
            return res.status(404).json({ message: "Expense not found" });
        }

        await expenseToDelete.destroy();
        return res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete expense", error: error.message });
    }
});

//monthly 
app.get('/monthly-expense', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const monthlyExpenses = await Expense.findAll({
            where: { SignUpId: userId },
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y-%m'), 'month'],  // Group by year-month
                [sequelize.fn('sum', sequelize.col('amount')), 'totalExpense']
            ],
            group: 'month',
            order: [['month', 'ASC']]
        });
        res.status(200).json({ monthlyExpenses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//yearly expense 
app.get('/yearly-expense', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const yearlyExpenses = await Expense.findAll({
            where: { SignUpId: userId },
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('date'), '%Y'), 'year'],  // Group by year
                [sequelize.fn('sum', sequelize.col('amount')), 'totalExpense']
            ],
            group: 'year',
            order: [['year', 'ASC']]
        });
        res.status(200).json({ yearlyExpenses });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//purchase premium 

app.get('/buy-premium', authenticate, async (req, res, next) => {
    const t = await sequelize.transaction(); // Start a transaction

    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const amount = 149.00;

        const order = await new Promise((resolve, reject) => {
            rzp.orders.create({ amount, currency: 'INR' }, (err, order) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(order);
                }
            });
        });

        await req.user.createOrder({ orderid: order.id, status: "PENDING" }, { transaction: t });

        await t.commit(); // Commit the transaction

        return res.status(201).json({ order, key_id: rzp.key_id });
    } catch (err) {
        await t.rollback(); // Rollback the transaction if an error occurs
        console.log(err);
        res.status(403).json({ message: 'Something went wrong', error: err.message });
    }
});



//update transection.
app.post('/updatetransectionstatus', authenticate, async (req, res, next) => {
    const { order_id, payment_id } = req.body;

    try {
        await sequelize.transaction(async (t) => {
            // Find the order within the transaction
            const order = await Order.findOne({ where: { orderid: order_id }, transaction: t });

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            // Update the order status and user's premium status within the transaction
            await Promise.all([
                order.update({ paymentId: payment_id, status: 'successful' }, { transaction: t }),
                req.user.update({ isPremiumUser: true }, { transaction: t })
            ]);

            // Commit the transaction if all operations are successful
            res.status(202).json({ success: true, message: 'Transaction successful' });
        });
    } catch (err) {
        // Log the error and handle it appropriately
        console.log(err);
        res.status(500).json({ success: false, message: 'Transaction failed' });
    }
});


app.get('/check-premium-status', authenticate, async (req, res, next) => {
    try {
        const user = req.user;

        // Check if the user is premium (you may have a field like isPremium in your Users model)
        const isPremium = user.isPremiumUser;

        return res.status(200).json({ isPremium });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error checking premium status', error: err.message });
    }
});

app.get('/premium/LeaderBoard', authenticate ,async(req,res,next)=>{
    try{
        const LeaderBoardData = await Users.findAll({
            attributes : ['id', 'name',[sequelize.fn('sum', sequelize.col('expenses.amount')), 'total_cost']],
            include : [
                {
                    model : Expense,
                    attributes : []

                  }
            ],
            group : ['id'],
            order : [['total_cost', 'DESC']]
        })
        res.status(200).json(LeaderBoardData);

    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }

});

app.post('/forgotPassword', async (req, res, next) => {
    try {
        const email = req.body.email;
        const user = await Users.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, msg: "Email not found" });
        }

        var apiInstance = new Brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(Brevo.AccountApiApiKeys.apiKey, process.env.BREVO_API_KEY);

        const link = await user.createResetPassword();

        let sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = "Reset password";
        sendSmtpEmail.htmlContent = `<p>Click the link to reset your password</p><a href="http://3.81.210.55:4000/resetpassword.html?reset=${link.id}">click here</a>`;
        sendSmtpEmail.sender = { "name": "Shatakshi", "email": "shatakshinimare27@gmail.com" };
        sendSmtpEmail.to = [{ "email": email }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        return res.status(200).json(JSON.stringify(data));
    } catch (e) {
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
});

app.post('/reset-password/:resetId' , async(req,res)=>{
   const t = await sequelize.transaction();
    try {
        const { resetId } = req.params;
        const { newPassword, confirmPassword } = req.body;

        const resetUser = await resetPassword.findByPk(resetId);
        if (!resetUser || !resetUser.isActive) {
            return res.status(401).json({ success: false, msg: "Link expired or invalid" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(403).json({ success: false, msg: "New and confirm password are different" });
        }

        const userId = resetUser.SignUpId;
        const user = await Users.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await Users.update({ passWord: hash }, { where: { id: user.id }, transaction: t });
        await resetUser.update({ isActive: false }, { transaction: t });

        await t.commit();
        return res.json({ success: true, msg: "Password changed successfully" });
    } catch (e) {
        await t.rollback();
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
})

app.get('/check-password-link/:resetId', async(req,res)=>{
    try {
        const resetUser = await resetPassword.findByPk(req.params.resetId);
        return res.json({ isActive: resetUser.isActive });
    } catch (e) {
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
})

function uploadToS3(data, fileName){
    const BUCKET_NAME = "exptrackershatakshi";
    const IAM_USER_KEY = process.env.AWS_ACCESS_KEY;
    const IAM_USER_SECRET = process.env.AWS_SECRET_ACCESS_KEY;

    const s3Client = new S3Client({
        region: "ap-south-1", // replace with your bucket's region
        credentials: {
            accessKeyId: IAM_USER_KEY ,
            secretAccessKey:  IAM_USER_SECRET,
        },
    })

    var params={
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: 'public-read'
    }
    return new Promise((resolve, reject) => {
        s3Client.send(new PutObjectCommand(params))
            .then((data) => {
                const fileURL = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
                console.log("Success", data);
                resolve(fileURL);
            })
            .catch((err) => {
                console.log("Something is Wrong", err);
                reject(err);
            });
    });
}



//downloading expense for each user
app.get('/download-expense',authenticate, async(req,res,next)=>{
    const userId = req.user.id;
    try{
        const name= await req.user.name;
        const random= Math.random();
        const users = await Expense.findAll({where : {SignUpId : userId}});
        console.log(users)
        const stringifiedExpenses = JSON.stringify(users);
        const fileName = `${name}_${random}.txt`;
        const fileURL = await uploadToS3(stringifiedExpenses, fileName);
        console.log(fileURL)
        const data = await FileURL.create({
            url : fileURL,
            SignUpId : userId
        })
        res.status(200).json({fileURL, success:true})


    }catch(error){
        res.status(500).json({error : error.message})
    };


   

})

app.get('/downloaded-files', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const files = await FileURL.findAll({ where: { SignUpId: userId } });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.use(favicon(nativePath.join(__dirname, 'views', 'favicon.ico')));

//app.use(express.static(nativePath.join(__dirname ,  'views')))

app.use((req, res, next) => {
    res.sendFile(nativePath.join(__dirname, 'views', req.path));
});




Expense.belongsTo(Users,{constraints: true, onDelete: 'CASCADE'});
Users.hasMany(Expense);

Order.belongsTo(Users, {constraints: true, onDelete: 'CASCADE'});
Users.hasMany(Order); 

Users.hasMany(resetPassword)
resetPassword.belongsTo(Users,{constraints: true, onDelete: 'CASCADE'});

FileURL.belongsTo(Users, {constraints: true, onDelete: 'CASCADE'});
Users.hasMany(FileURL);

sequelize.sync()
    .then(()=>{
        app.listen(process.env.PORT || 4000)
        console.log('server is running on 4000')

    })
    .catch((error)=>{
        console.log(error);
    });
