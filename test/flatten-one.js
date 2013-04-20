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

    var timestamp1 = '013d58c7276e-0000-188c-786ae2e1f629';

    test('test putItem()', function(t) {
        // put an item
        db.putItem('chilts', timestamp1, item, function(err) {
            t.ok(!err, 'flatten-one: No error when putting an item');
            t.end();
        });
    });

    test('test flatten()', function(t) {
        // get this item back
        db.getItem('chilts', function(err, changeset) {
            t.ok(!err, 'flatten-one: No error when getting an item back');

            t.deepEqual(changeset.value, item, 'flatten-one: Check the stored item is correct');

            // test that we know what the hash is of
            var hashThis = '\nchilts\n013d58c7276e-0000-188c-786ae2e1f629\nputItem\n{"nick":"chilts"}\n';
            var hash = crypto.createHash('md5').update(hashThis).digest('hex');
            t.equal(changeset.hash, hash, 'flatten-one: The calculated hash and the one we expect are the same');
            t.equal(changeset.hash, '2b847185c137c7f8ff54bf5ebf72bb6e', 'flatten-one: The last hash of this item should be this');

            db.flatten('chilts', changeset.hash, function(err) {
                t.ok(!err, 'flatten-one: No error when flattening an item');
                t.end();
            });
        });
    });

};

// ----------------------------------------------------------------------------
