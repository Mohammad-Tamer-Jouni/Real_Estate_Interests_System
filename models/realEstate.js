const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

var realEstateSchema = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: [String],
    category: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    coordinates: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [Number]
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

var RealEstate = mongoose.model('RealEstate', realEstateSchema);

module.exports = RealEstate;