// ----------------------------------------------------------------------------

module.exports = function(db) {

    var crypto = require('crypto');

    var underscore = require('underscore');
    var tap = require('tap');

    var helpers = require('./helpers.js');

    var test = tap.test;
    var ts = helpers.timestamp;

    // ----------------------------------------------------------------------------

    var obj = {
        nick : 'chilts',
    };

    // use our own timestamp
    var timestamp1 = '013d58c7276e-0000-188c-786ae2e1f629';
    var timestamp2 = '013d58c7276f-0002-188c-786ae2e1f629';
    var hash1 = 'dbdbab3832f5594e33ded7e286551518';
    var hash2 = 'f11e653684a0170fd9373886c1002133';

    test('test putItem()', function(t) {
        // put an item, but use our own timestamp
        db.putItem('chilts', timestamp1, obj, function(err) {
            t.ok(!err, 'history: (1) No error when putting an item');
            t.end();
        });
    });

    test('test getItem()', function(t) {
        // get this item back
        db.getItem('chilts', function(err, item) {
            t.ok(!err, 'history: (2) No error when getting an item back');

            t.equal(item.changes, 1, 'history: (2) The number of changes is 1');
            t.ok(item.timestamp, 'history: (2) The timestamp is a true(ish) value');
            t.equal(item.timestamp, timestamp1, 'history: (2) The timestamp is what we expect');
            t.ok(item.hash, 'history: (2) The hash is a true(ish) value');
            t.equal(item.hash, hash1, 'history: (2) The hash is equal to what we expect');
            t.deepEqual(item.value, obj, 'history: (2) Item is what we expect');

            // test that we know what the hash is of
            var hashThis = 'chilts/013d58c7276e-0000-188c-786ae2e1f629/putItem\n{"nick":"chilts"}\n';
            var hash = crypto.createHash('md5').update(hashThis).digest('hex');
            t.equal(item.hash, hash, 'history: (2) The calculated hash and the one we expect are the same');

            t.end();
        });
    });

    test('test put()', function(t) {
        // add some more attrs, then get it back out again
        db.put('chilts', timestamp2, { 'admin' : true }, function(err, storedItem, meta) {
            t.ok(!err, 'history: No error when putting some attributes');

            // get this item back
            db.getItem('chilts', function(err, item) {
                t.ok(!err, 'history: (3) No error when getting an item back');

                var currentItem = {
                    nick  : 'chilts',
                    admin : true,
                };

                t.equal(item.changes, 2, 'history: (3) The number of changes is 2');
                t.ok(item.timestamp, 'history: (3) The timestamp is a true(ish) value');
                t.equal(item.timestamp, timestamp2, 'history: (3) The timestamp is what we expect');
                t.ok(item.hash, 'history: (3) The hash is a true(ish) value');
                t.equal(item.hash, hash2, 'history: (3) The hash is what we expect');
                t.deepEqual(item.value, currentItem, 'history: (3) Item is what we expect');

                // test that we know what the hash is of (the hash of the last changeset, plus this one)
                var hashThis = hash1 + "\n";
                hashThis += 'chilts/' + timestamp2 + '/put\n{"admin":true}\n';
                console.log('hashThis=' + hashThis);
                var hash = crypto.createHash('md5').update(hashThis).digest('hex');
                t.equal(item.hash, hash, 'history: (3) The calculated hash and the one we expect are the same');

                t.end();
            });
        });
    });

};

// ----------------------------------------------------------------------------
