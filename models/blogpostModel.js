///................mongodb scheme model for blogposts

const mongoose = require('mongoose');

const blogpost = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    }




}, {
    timestamps: true
})

module.exports = mongoose.model('blogpost', blogpost);