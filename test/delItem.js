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

    test('test putItem', function(t) {
        // put an item
        db.putItem('chilts', ts(), item, function(err) {
            t.ok(!err, 'delItem: No error when putting an item');
            t.end();
        });
    });

    test('test delItem', function(t) {
        // delete this item
        db.delItem('chilts', ts(), function(err) {
            console.log('2');
            t.ok(!err, 'delItem: No error when deleting this item');
            t.end();
        });
    });

    test('test getItem (no item found)', function(t) {
        // get this item back
        db.getItem('chilts', function(err, changeset) {
            t.ok(!err, 'delItem: No error when getting an item back');
            t.equal(changeset.value, undefined, 'delItem: Item is undefined');
            t.end();
        });
    });

};

// ----------------------------------------------------------------------------
