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

    test('test putItem()', function(t) {
        // put an item
        db.putItem('chilts', ts(), item, function(err) {
            t.ok(!err, 'set: No error when putting an item');
            t.end();
        });
    });

    test('test set()', function(t) {
        db.set('chilts', ts(), { email : 'me@example.com', logins : 28, admin : true }, function(err) {
            t.ok(!err, 'set: No error when putting some attributes');
            t.end();
        });
    });

    test('test getItem()', function(t) {
        // get this item back
        db.getItem('chilts', function(err, changesets) {
            t.ok(!err, 'set: No error when getting an item back');

            var newItem = {
                nick : 'chilts',
                uuid : 'f6deec09-c6c5-44eb-9c46-158bd35d0303',
                admin : true,
                logins : 28,
                email : 'me@example.com',
            };

            console.log(changesets);

            t.deepEqual(changesets.value, newItem, 'set: Item has been modified ok (put())');
            t.end();
        });
    });

};

// ----------------------------------------------------------------------------
