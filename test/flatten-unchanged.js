// ----------------------------------------------------------------------------

module.exports = function(db) {

    var crypto = require('crypto');

    var underscore = require('underscore');
    var tap = require('tap');

    var helpers = require('./helpers.js');

    var test = tap.test;
    var ts = helpers.timestamp;

    // ----------------------------------------------------------------------------

    var item = {
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

    test('test putItem()', function(t) {
        // put an item
        db.putItem('chilts', timestamp1, item, function(err) {
            t.ok(!err, 'flatten-unchanged: (1) No error when putting an item');

            db.getItem('chilts', function(err, changeset) {
                t.ok(!err, 'flatten-unchanged: (1) No error when getting an item back');

                t.deepEqual(changeset.value, item, 'flatten-unchanged: (1) Check the stored item is correct');

                // test that we know what the hash is of
                t.equal(changeset.hash, hash1, 'flatten-unchanged: (1) The last hash of this item should be this');

                var hashThis = '\nchilts\n013d58c7276e-0000-188c-786ae2e1f629\nputItem\n{"nick":"chilts"}\n';
                var hash = crypto.createHash('md5').update(hashThis).digest('hex');
                t.equal(changeset.hash, hash, 'flatten-unchanged: (1) The calculated hash and the one we expect are the same');

                t.end();
            });
        });
    });

    test('test set()', function(t) {
        db.set('chilts', timestamp2, { logins : 10 }, function(err) {
            t.ok(!err, 'flatten-unchanged: (2) No error when putting some attributes');

            db.getItem('chilts', function(err, changeset) {
                t.ok(!err, 'flatten-unchanged: (2) No error when getting an item back');

                t.deepEqual(changeset.value, expectedItem, 'flatten-unchanged: (2) Check the stored item is correct');

                // test that we know what the hash is of
                t.equal(changeset.hash, hash2, 'flatten-unchanged: (2) The last hash of this item should be this');

                var hashThis = hash1 + "\n";
                hashThis += "chilts\n013d58c7276f-0000-188c-786ae2e1f629\nset\n";
                hashThis += '{"logins":10}\n';

                var hash = crypto.createHash('md5').update(hashThis).digest('hex');
                t.equal(changeset.hash, hash, 'flatten-unchanged: (2) The calculated hash and the one we expect are the same');

                t.end();
            });
        });
    });

    test('test flatten()', function(t) {
        // get the item, flatten it, then re-get it
        db.getItem('chilts', function(err, changeset1) {
            t.ok(!err, 'flatten-unchanged: (3) No error when getting the item');

            // now flatten the item
            db.flatten('chilts', changeset1.hash, function(err) {
                t.ok(!err, 'flatten-unchanged: (3) No error when flattening the item');

                db.getItem('chilts', function(err, changeset2) {

                    t.deepEqual(changeset1.value, expectedItem, 'flatten-unchanged: (3) Item is identical to expected');
                    t.deepEqual(changeset1.value, changeset2.value, 'flatten-unchanged: (3) Item is identical after flattening');

                    t.equal(changeset1.hash, changeset2.hash, "flatten-unchanged: (3) Item's hash is still the same");
                    t.equal(changeset1.changes, changeset2.changes, "flatten-unchanged: (3) Item's changes are the same");

                    t.end();
                });
            });
        });
    });

    test('test flatten()', function(t) {
        // get the item, flatten it, then re-get it
        db.getItem('chilts', function(err, changeset1) {
            t.ok(!err, 'flatten-unchanged: (4) No error when getting the item');

            // now flatten the item
            db.flatten('chilts', changeset1.hash, function(err) {
                t.ok(!err, 'flatten-unchanged: (4) No error when flattening the item');

                db.getItem('chilts', function(err, changeset2) {

                    t.deepEqual(changeset1.value, expectedItem, 'flatten-unchanged: (4) Item is identical to expected');
                    t.deepEqual(changeset1.value, changeset2.value, 'flatten-unchanged: (4) Item is identical after flattening');

                    t.equal(changeset1.hash, changeset2.hash, "flatten-unchanged: (4) Item's hash is still the same");
                    t.equal(changeset1.changes, changeset2.changes, "flatten-unchanged: (4) Item's changes are the same");

                    t.end();
                });
            });
        });
    });

};

// ----------------------------------------------------------------------------
