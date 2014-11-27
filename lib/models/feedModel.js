'use strict';
///////////////
// feedModel //
///////////////
require('../db/schema');
var Iconv = require('iconv').Iconv,
    iconv = new Iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE'),

    FeedParser = require('feedparser'),
    mongoose = require('mongoose'),
    Feed = mongoose.model('Feed'),
    http = require('http'),
    Config = require('../config/config');

/**
 * [feed_url url to rss feed]
 * @type {String}
 */
var feed_url = Config.Feed_url;

/**
 * [feedModel description]
 * @type {Object}
 */
var feedModel = {};
/**
 * [_fetch_feeds_and_store Private Function responsible for fetching feed and storing it to db]
 * @param  {Function} callback
 * @return {null}
 */
feedModel._fetch_feeds_and_store = function() {
    //  var options = {};
    var feed_data = [];
    Feed.remove({}, function(err) {
        if (err) {
            console.log(err);
        }

        console.log('Deleted All Previous Records');


        var index = 0;
        http.get(feed_url, function(res) {
            res.pipe(new FeedParser({}))
                .on('error', function(error) {
                    // TODO: Tell the user we just had a melt-down
                    console.log(error);
                })
                .on('meta', function(meta) {
                    // Store the metadata for later use
                    //feedMeta = meta;
                    console.log(meta);
                })
                .on('readable', function() {
                    var stream = this,
                        item;

                    while ((item = stream.read()) !== null) {
                        // Each 'readable' event will contain 1 article
                        // Add the article to the list of episodes

                        var ep = {
                            'title': item.title,
                            'url': item.link,
                            'pubDate': item.pubDate,
                            'description': iconv.convert(item.description),
                            'index': index,
                        };
                        index = index + 1;
                        feed_data.push(ep);
                    }
                })
                .on('end', function() {
                    feed_data.forEach(function(item) {

                        new Feed(item).save();

                    });
                    console.log('100% Saved.');
                });
        });
    });


};
/**
 * [get_feed_by_index  1. checking db in sync, then 2. fetching single Article stored at location {index}]
 * @param  {int}   index
 * @param  {Function} callback
 * @return {null}
 */
feedModel.get_feed_by_index = function(index, callback) {
    Feed.findOne({
        index: index
    }, function(err, data) {
        callback(err, data);
    });
};
/**
 * [get_slugs_by_offset 1. checking db in sync, then 2. fetching slug from offset to next n (count)]
 * @param  {int}   offset
 * @param  {int}   count
 * @param  {Function} callback
 * @return {null}
 */
feedModel.get_slugs_by_offset = function(offset, count, callback) {
    if (count < 1) {
        count = 1;
    }
    Feed.find({
        index: {
            $lt: count + offset,
            $gte: offset
        }
    }, {
        title: 1,
        index: 1,
        url: 1
    }, {
        sort: {
            index: 1
        }
    }, function(err, data) {
        callback(err, data);
    });
};

/**
 * [get_Article_by_url description]
 * @param  {String}   url_link [description]
 * @param  {Function} callback [description]
 * @return {null}            [description]
 */
feedModel.get_Article_by_url = function(url_link, callback) {
    Feed.findOne({
        url: {
            $regex: ".*" + url_link + "/"
        }
        //TODO :: Not a good logic to fetch url based article
    }, function(err, data) {
        callback(err, data);
    });
};
/**
 * [exports Api Router]
 * @type {[Router]}
 */
module.exports = feedModel;
