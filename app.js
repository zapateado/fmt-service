const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const torrent = require('./torrent');
const {connectionUrl} = require('./config');

const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(helmet());

mongoose.connect(connectionUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err) => {
    if(err) {
        console.log(err);
    }

    console.log("Connection to mongo baby!!");
})

const regexExp = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

app.get("/search", (req, res) => {
    if(req.query.search) {
        const regex = new RegExp(regexExp(req.query.search.toString()), "gi");
        // console.log(req.query.search)
        
        torrent.torrentCollection.find({"Name": regex}, (err, foundTorrents) => {
            if(err) {
                console.log(err);
            } else {
                // console.log(foundTorrents)
                res.json(foundTorrents);
            }
        });
    }
});

app.get("/", (req, res) => {
    res.send("Serving is running!");
});

app.listen(port, () => console.log(`listening on port ${port}`))