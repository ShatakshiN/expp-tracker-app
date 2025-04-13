const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

require('dotenv').config();

//models
const Users = require('../models/users');


function isStrValid(str) {
    return (str === undefined || str.length === 0);
};


router.post('/signUp', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (isStrValid(name) || isStrValid(email) || isStrValid(password)) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Users({ name, email, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: "Sign up successful" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

function generateAccessToken(id) {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET);
}

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (isStrValid(email) || isStrValid(password)) {
            return res.status(400).json({ message: "Missing email or password" });
        }

        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = generateAccessToken(user._id);
        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


module.exports = router;
