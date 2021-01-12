const mongoose = require('mongoose');

const blogpost = new mongoose.Schema({
 
        title:{
            type: String,
            required: true
        },
        body:{
            type: String,
            required: true
        },
        userid:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        }
        
        // date:{
        //     type: Date,
        //     default: new Date()
        // },
        


}, {
    timestamps: true
    // adds a date for creation and last update
})

module.exports = mongoose.model('blogpost', blogpost);