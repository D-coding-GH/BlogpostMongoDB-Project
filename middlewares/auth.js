//.....middleware, authentication create cookies during login/user registration

const { promisify } = require("util");

const jwt = require('jsonwebtoken');

const User = require('../models/userModel');




exports.isLoggedIn = async (req, res, next) => {

    if (req.cookies.jwt) {

        const decoded = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);


        console.log("my token decoded")
        console.log(decoded)

        req.userFound = await User.findById(decoded.id)
        console.log(req.userFound)
    }

    next()

}


exports.logout = (req, res, next) => {

    res.cookie('jwt', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    
    next()
}


