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

    test('test putItem()', function(t) {
        // put an item
        db.putItem('chilts', timestamp1, item, function(err) {
            t.ok(!err, 'flatten-twice: (1) No error when putting an item');

            db.getItem('chilts', function(err, changeset) {
                t.ok(!err, 'flatten-twice: (1) No error when getting an item back');

                t.deepEqual(changeset.value, item, 'flatten-twice: (1) Check the stored item is correct');

                // test that we know what the hash is of
                t.equal(changeset.hash, 'dbdbab3832f5594e33ded7e286551518', 'flatten-twice: (1) The last hash of this item should be this');

                var hashThis = 'chilts/013d58c7276e-0000-188c-786ae2e1f629/putItem\n{"nick":"chilts"}\n';
                var hash = crypto.createHash('md5').update(hashThis).digest('hex');
                t.equal(changeset.hash, hash, 'flatten-twice: (1) The calculated hash and the one we expect are the same');

                t.end();
            });
        });
    });

    test('test put()', function(t) {
        db.set('chilts', timestamp2, { logins : 10 }, function(err) {
            t.ok(!err, 'flatten-twice: (2) No error when putting some attributes');

            db.getItem('chilts', function(err, changeset) {
                t.ok(!err, 'flatten-twice: (2) No error when getting an item back');

                t.deepEqual(changeset.value, expectedItem, 'flatten-twice: (2) Check the stored item is correct');

                // test that we know what the hash is of
                t.equal(changeset.hash, '897547f3b4f8f6e09785a8aa3e79e32d', 'flatten-twice: (2) The last hash of this item should be this');

                var hashThis = "dbdbab3832f5594e33ded7e286551518\n";
                hashThis += "chilts/013d58c7276f-0000-188c-786ae2e1f629/put\n";
                hashThis += '{"logins":10}\n';

                var hash = crypto.createHash('md5').update(hashThis).digest('hex');
                t.equal(changeset.hash, hash, 'flatten-twice: (2) The calculated hash and the one we expect are the same');

                t.end();
            });
        });
    });

    test('test flatten()', function(t) {
        // get the item, flatten it, then re-get it
        db.getItem('chilts', function(err, changeset1) {
            t.ok(!err, 'flatten-twice: (3) No error when getting the item');

            // now flatten the item
            db.flatten('chilts', changeset1.hash, function(err) {
                t.ok(!err, 'flatten-twice: (3) No error when flattening the item');

                db.getItem('chilts', function(err, changeset2) {

                    t.deepEqual(changeset1.value, expectedItem, 'flatten-twice: (3) Item is identical to expected');
                    t.deepEqual(changeset1.value, changeset2.value, 'flatten-twice: (3) Item is identical after flattening');

                    t.equal(changeset1.hash, changeset2.hash, "flatten-twice: (3) Item's hash is still the same");
                    t.equal(changeset1.changes, changeset2.changes, "flatten-twice: (3) Item's changes are the same");

                    t.end();
                });
            });
        });
    });

    test('test del()', function(t) {
        db.del('chilts', timestamp3, [ 'logins' ], function(err) {
            t.ok(!err, 'flatten-twice: (4) No error when deleting some attributes');

            db.getItem('chilts', function(err, changeset) {
                t.ok(!err, 'flatten-twice: (4) No error when getting an item back');

                t.deepEqual(changeset.value, item, 'flatten-twice: (4) Check the stored item is correct (original item)');

                // test that we know what the hash is of
                t.equal(changeset.hash, '72d2fe100cd3dbf6da4948d01fb455db', 'flatten-twice: (4) The last hash of this item should be this');

                var hashThis = "897547f3b4f8f6e09785a8aa3e79e32d\n";
                hashThis += "chilts/" + timestamp3 + "/del\n";
                hashThis += '["logins"]\n';

                var hash = crypto.createHash('md5').update(hashThis).digest('hex');
                t.equal(changeset.hash, hash, 'flatten-twice: (4) The calculated hash and the one we expect are the same');

                t.end();
            });
        });
    });

    test('test flatten()', function(t) {
        // get the item, flatten it, then re-get it
        db.getItem('chilts', function(err, changeset1) {
            t.ok(!err, 'flatten-twice: (5) No error when getting the item');

            // now flatten the item
            db.flatten('chilts', changeset1.hash, function(err) {
                t.ok(!err, 'flatten-twice: (5) No error when flattening the item');

                db.getItem('chilts', function(err, changeset2) {

                    t.deepEqual(changeset1.value, item, 'flatten-twice: (5) Item is identical to expected');
                    t.deepEqual(changeset1.value, changeset2.value, 'flatten-twice: (5) Item is identical after flattening');

                    t.equal(changeset1.hash, changeset2.hash, "flatten-twice: (5) Item's hash is still the same");
                    t.equal(changeset1.changes, changeset2.changes, "flatten-twice: (5) Item's changes are the same");

                    t.end();
                });
            });
        });
    });

};

// ----------------------------------------------------------------------------
