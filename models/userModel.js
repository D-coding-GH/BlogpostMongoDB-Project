const mongoose = require('mongoose');
const { stringify } = require('querystring');
 //...ask where this has come from
///....create scheme/collection of data via objects/keys to add to the database
const user = new mongoose.Schema({
    name: {
        type: String,
        required: true
        // required is a backend validation
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