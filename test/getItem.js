// ----------------------------------------------------------------------------

module.exports = function(db) {

    var underscore = require('underscore');
    var tap = require('tap');

    var helpers = require('./helpers.js');

    var test = tap.test;
    var ts = helpers.timestamp;

    // ----------------------------------------------------------------------------

    var item = {
        nick : 'chilts',
        uuid : 'f6deec09-c6c5-44eb-9c46-158bd35d0303',
        admin : false,
        logins : 27,
    };

    var timestamp = '2013-03-15T23:44:24.569Z';

    test('test putItem', function(t) {
        // put an item
        db.putItem('chilts', timestamp, item, function(err) {
            t.ok(!err, 'No error when putting an item');
            t.end();
        });
    });

    test('test getItem', function(t) {
        // get this item back
        db.getItem('chilts', function(err, changeset) {
            t.ok(!err, 'getItem: No error when getting an item back');
            t.deepEqual(changeset.value, item, 'getItem: The item and the one stored are the same');
            t.ok(changeset.timestamp, 'getItem: Timestamp is there and is true(ish)');
            t.equal(changeset.timestamp, timestamp, 'getItem: Timestamp is there is what we expect');
            t.equal(changeset.changes, 1, 'getItem: So far, there has only been one change');
            t.similar(changeset.hash, /^[a-f0-9]{32}$/, 'getItem: hash looks like an MD5 hash');
            t.end();
        });
    });

    test('test getItem (no item found)', function(t) {
        // get this item back
        db.getItem('pie', function(err, item) {
            console.log(item);
            t.ok(!err, 'No error when getting an item back');
            t.equal(item.value, undefined, 'Item is undefined');
            t.end();
        });
    });

};

// ----------------------------------------------------------------------------
