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

    var expectedItem = {
        nick   : 'chilts',
        logins : 10,
    };

    var timestamp1 = '013d58c7276e-0000-188c-786ae2e1f629';
    var timestamp2 = '013d58c7276f-0000-188c-786ae2e1f629';
    var timestamp3 = '013d58c7286f-0000-188c-786ae2e1f629';
    var hash1 = '2b847185c137c7f8ff54bf5ebf72bb6e';
    var hash2 = '2b2fab567713b6f22132e049e0690a9f';
    var hash3 = '0c106cc2c756b93c87bd1bfcf376988c';

    test('test putItem()', function(t) {
        // put an item
        db.putItem('chilts', timestamp1, obj, function(err) {
            t.ok(!err, 'flatten-three: No error when putting an item');

            db.getItem('chilts', function(err, item) {
                t.ok(!err, 'flatten-three: (1) No error when getting an item back');

                t.deepEqual(item.value, obj, 'flatten-three: (1) Check the stored item is correct');

                // test that we know what the hash is of
                t.equal(item.hash, hash1, 'flatten-three: (1) The last hash of this item should be this');

                var hashThis = '\nchilts\n013d58c7276e-0000-188c-786ae2e1f629\nputItem\n{"nick":"chilts"}\n';
                var hash = crypto.createHash('md5').update(hashThis).digest('hex');
                t.equal(item.hash, hash, 'flatten-three: (1) The calculated hash and the one we expect are the same');

                t.end();
            });
        });
    });

    test('test set()', function(t) {
        db.set('chilts', timestamp2, { logins : 10 }, function(err) {
            t.ok(!err, 'flatten-three: (2) No error when putting some attributes');

            db.getItem('chilts', function(err, item) {
                t.ok(!err, 'flatten-three: (2) No error when getting an item back');

                t.deepEqual(item.value, expectedItem, 'flatten-three: (2) Check the stored item is correct');

                // test that we know what the hash is of
                t.equal(item.hash, hash2, 'flatten-three: (2) The last hash of this item should be this');

                var hashThis = hash1 + "\n";
                hashThis += "chilts\n013d58c7276f-0000-188c-786ae2e1f629\nset\n";
                hashThis += '{"logins":10}\n';

                var hash = crypto.createHash('md5').update(hashThis).digest('hex');
                t.equal(item.hash, hash, 'flatten-three: (2) The calculated hash and the one we expect are the same');

                t.end();
            });
        });
    });

    test('test del()', function(t) {
        db.del('chilts', timestamp3, [ 'logins' ], function(err) {
            t.ok(!err, 'flatten-three: (3) No error when deleting some attributes');

            db.getItem('chilts', function(err, item) {
                t.ok(!err, 'flatten-three: (3) No error when getting an item back');

                t.deepEqual(item.value, obj, 'flatten-three: (3) Check the stored item is correct (original item)');

                // test that we know what the hash is of
                t.equal(item.hash, hash3, 'flatten-three: (3) The last hash of this item should be this');

                var hashThis = hash2 + "\n";
                hashThis += "chilts\n" + timestamp3 + "\ndel\n";
                hashThis += '["logins"]\n';

                var hash = crypto.createHash('md5').update(hashThis).digest('hex');
                t.equal(item.hash, hash, 'flatten-three: (3) The calculated hash and the one we expect are the same');

                t.end();
            });
        });
    });

    test('test flatten()', function(t) {
        // get the item, flatten it, then re-get it
        db.getItem('chilts', function(err, item1) {
            t.ok(!err, 'flatten-three: (4) No error when getting the item');

            // now flatten the item
            db.flatten('chilts', item1.hash, function(err) {
                t.ok(!err, 'flatten-three: (4) No error when flattening the item');

                db.getItem('chilts', function(err, item2) {

                    t.deepEqual(item1.value, obj, 'flatten-three: (4) Item is identical to expected');
                    t.deepEqual(item1, item2, 'flatten-three: (4) Item is identical after flattening');

                    t.equal(item1.hash, item2.hash, "flatten-three: (4) Item's hash is still the same");
                    t.equal(item1.changes, item2.changes, "flatten-three: (4) Item's changes are the same");

                    t.end();
                });
            });
        });
    });

};

// ----------------------------------------------------------------------------
