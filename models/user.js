var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    admin: {
        type: Boolean,
        default: false
    },
    mobileNumber: {
        type: String,
        default: ''
    },
    walletAddress: {
        type: String,
        default: ''
    },
    // listedProperties: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'RealEstate'
    // }]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);