///................mongodb database scheme model for user profiles

const mongoose = require('mongoose');
const { stringify } = require('querystring');
 
const user = new mongoose.Schema({
    name: {
        type: String,
        required: true
        
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});


module.exports = mongoose.model('user', user);