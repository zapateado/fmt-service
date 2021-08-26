const mongoose = require('mongoose');
const schema = new mongoose.Schema({
    Seeders: Number,
    Leechers: Number,
    Source: {
        type: String,
        trim: true
    },
    Name: {
        type: String,
        trim: true
    },
    Link: {
        type: String,
        trim: true
    },
    _id: {
        type: String,
        trim: true
    },
    Size: Number,
    UploadDate: Date
    
}, {versionKey: false});


module.exports = {
    torrentCollection: mongoose.model('torrents', schema)
};