const axios = require('axios')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config();

const { connectionUrl } = require('../config')
const { torrent, torrentCollection } = require('../torrent')

mongoose.connect(connectionUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const baseUrl = "https://katcr.to"
const categories = [
    "movies",
    "tv",
    "music",
    "games",
    "apps",
    "anime",
    "other"
];

function getSize(inp) {
    if(inp.includes("MB")) {
        return Number.parseInt(inp.trim().replace("MB", "").trim(), 10);

    }

    return Number.parseInt(inp.trim().replace("MB", "").trim(), 10) * 1024;
}

function getDate(inp) {
    if(inp.includes("min") || inp.includes("hour")) {
        return (new Date()).getTime();
    }

    inp.replace("days", "");
    inp.replace("day", "");

    return ((new Date()).getTime() - parseInt(inp.trim()) * 24 * 3600 * 1000);
}

async function parse() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const puppetPage = await browser.newPage();

    for(var cat = categories.length - 1; cat >= 0; cat--) {
        const category = categories[cat];
        for(var page = 200; page >= 1; page--) {
            try {
                const currentPage = `${baseUrl}/${category}/${page}`;
                await puppetPage.goto(currentPage);
                const bodyHtml = await puppetPage.evaluate(() => document.body.innerHTML);

                const $ = await cheerio.load(bodyHtml);
                const table = $("#wrapperInner > div.mainpart > table > tbody > tr > td:nth-child(1) > div:nth-child(2) > table > tbody").children().toArray();

                table.forEach((itr, i, arr) => {
                    if(i != 0) {
                        const tds = $(itr).children().toArray();
                        var currentTorrent = {};
                        currentTorrent.Name = $(tds[0]).text().trim().substring(0, $(tds[0]).text().trim().indexOf("Posted by")).trim();
                        currentTorrent.Link = baseUrl + $($(tds[0]).children().children()[0]).attr("href").trim();
                        currentTorrent.Size = getSize($(tds[1]).text().trim().trim());
                        currentTorrent.UploadDate = getDate($(tds[3]).text().trim().trim());
                        currentTorrent._id = currentTorrent.Link;
                        
                        currentTorrent.Source = "katcr";
                        currentTorrent.Seeders = Number.parseInt($(tds[4]).text().trim(), 10);
                        currentTorrent.Leechers = Number.parseInt($(tds[5]).text().trim(), 10);

                        (new torrentCollection(currentTorrent)).save((err) => {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log(`Added ${currentTorrent.Name}`)
                            }
                        })

                        // console.log(currentTorrent)
                    }
                });
            } catch(err) {
                console.log(err);
            }
        }
    }

    await browser.close();

};


parse();