const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    realEstate: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RealEstate'
    }
    ]
}, {
    timestamps: true
});


var Favorites = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorites;