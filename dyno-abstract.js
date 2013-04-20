// ----------------------------------------------------------------------------

var crypto = require('crypto');

var _ = require('underscore');
var copy = require('copy');

// ----------------------------------------------------------------------------

var DynoAbstract = function() {};

// ----------------------------------------------------------------------------
// helper functions

DynoAbstract.prototype.performOp = function performOp(item, op, value) {
    console.log('1) item:', item);
    console.log('2) op:', op);
    console.log('3) value:', value);

    if ( op === 'history' ) {
        // replace the entire item
        item = value;
    }
    else if ( op === 'putItem' ) {
        // replace the entire item
        item = value;
    }
    else if ( op === 'delItem' ) {
        item = {};
    }
    else if ( op === 'set' ) {
        item = _.extend(item, value);
    }
    else if ( op === 'del' ) {
        value.forEach(function(v, i) {
            delete item[v];
        });
    }
    else if ( op === 'inc' ) {
        // does these operations: inc, incBy, dec, decBy
        if ( typeof item[value.attrName] === 'number' ) {
            item[value.attrName] += value.by;
        }
        else {
            // overwrite the item (since we don't ever want to error)
            item[value.attrName] = value.by;
        }
    }
    else if ( op === 'append' ) {
        // make sure the item is a string
        console.log('*** = ' + item[value.attrName]);
        if ( typeof item[value.attrName] !== 'undefined' ) {
            item[value.attrName] = '' + item[value.attrName] + value.str;
        }
        else {
            // just set it to the string
            item[value.attrName] = value.str;
        }
    }
    else if ( op === 'addToSet' ) {
        // make sure the item is a string
        console.log('*** addToSet=' + item[value.attrName]);
        if ( value.attrName in item ) {
            // Fix: currently we're assuming it is already an object
            console.log('Adding value to set');
            if ( _.isObject(item[value.attrName]) ) {
                item[value.attrName][value.value] = true;
            }
            else {
                // this doesn't look like an object, so we need to convert it to one (get the existing value first)
                var existing = item[value.attrName];
                item[value.attrName] = {};
                item[value.attrName][existing] = true;
                item[value.attrName][value.value] = true;
            }
        }
        else {
            // make a new object and set this value
            console.log('Adding a new attr set');
            item[value.attrName] = {};
            item[value.attrName][value.value] = true;
        }
    }
    return item;
}

// instrumentChangesets(changesets) -> returns changesets
//
// This function loops through all the changesets and instruments them with the hash, changes and value of the item at
// that point in time.
DynoAbstract.prototype.instrumentChangesets = function instrumentChangesets(changesets) {
    var self = this;

    var currentItem = {};
    var lastHash;
    var totalChanges = 0;

    changesets.forEach(function(changeset, i) {
        var currentTimestamp;

        // calculate the history
        if ( changeset.operation === 'history' ) {
            currentHash  = changeset.hash;
            totalChanges = changeset.changes;
            currentItem  = changeset.item;
        }
        else {
            // this is a regular operation
            var hashThis = '';
            if ( lastHash ) {
                hashThis = lastHash + "\n";
            }
            hashThis += changeset.name + '/' + changeset.timestamp + '/' + changeset.operation + "\n";
            hashThis += JSON.stringify(changeset.change) + "\n";
            currentHash = crypto.createHash('md5').update(hashThis).digest('hex');
            console.log('---');
            console.log(hashThis);
            console.log('---');
            totalChanges++;
            // save the actual change itself
            thisValue = changeset.change;
        }

        // remember a few things
        lastTimestamp = changeset.timestamp;
        lastHash      = currentHash;

        // perform this operation
        currentItem = self.performOp(currentItem, changeset.operation, changeset.change);
        changeset.item = copy(currentItem);
    });

    return changesets;
};

DynoAbstract.prototype.reduce = function reduce(changesets) {
    var self = this;

    if ( typeof changesets === 'undefined' ) {
        return {};
    }

    var value = {};

    var totalChanges = 0;
    var lastTimestamp;
    var lastHash = '';

    // Each changeset contains name, timestamp, operation. It contains 'value' if this is a regular operation, but
    // contains 'changes', 'item' and 'hash' if this is a 'history' operation.
    console.log('reduce(): changesets:', changesets);
    changesets.forEach(function(changeset, i) {
        var currentTimestamp;

        // calculate the history
        if ( changeset.operation === 'history' ) {
            currentHash  = changeset.hash;
            totalChanges = changeset.changes;
            value        = changeset.value;
        }
        else {
            // this is a regular operation
            var hashThis = '';
            if ( lastHash ) {
                hashThis = lastHash + "\n";
            }
            hashThis += changeset.name + "\n" + changeset.operation + "\n" + changeset.timestamp + "\n";
            hashThis += changeset.name + "\n" + changeset.operation + "\n" + changeset.timestamp + "\n";
            hashThis += changeset.name + "\n" + changeset.operation + "\n" + changeset.timestamp + "\n";
            hashThis += JSON.stringify(changeset.change) + "\n";
            console.log('HASHING:' + hashThis + "\n");
            currentHash = crypto.createHash('md5').update(hashThis).digest('hex');
            totalChanges++;
        }

        // remember a few things
        lastTimestamp = changeset.timestamp;
        lastHash      = currentHash;

        // perform this operation
        value = self.performOp(value, changeset.operation, changeset.change);
    });

    if ( Object.keys(value).length === 0 ) {
        value = undefined;
    }

    // create the last changeset (minus the name and operations)
    var item = {
        timestamp : lastTimestamp,
        value     : value,
        changes   : totalChanges,
        hash      : lastHash,
    };

    return item;
}

// ----------------------------------------------------------------------------
// functions that should be implemented by a derivative class

// _putOperation(operationName, itemName, timestamp, operation, change) -> callback(err)
//
// This puts this operation+change (with timestamp) to this item.
DynoAbstract.prototype._putOperation = function(operationName, itemName, timestamp, change, callback) {
    throw new Error('Classes derived from DynoAbstract should implement _putOperation()');
};

// _getChangesets(itemName, callback) -> (err, changesets)
//
// This retrieves all changesets for this item
DynoAbstract.prototype._getChangesets = function(itemName, callback) {
    throw new Error('Classes derived from DynoAbstract should implement _getChangesets()');
};

// ----------------------------------------------------------------------------
// operations that can be implemented using the above methods

// Note: all operations work on attributes, except putItem() and delItem().

// putItem(itemName, timestamp, item, callback) -> (err)
//
// This replaces the entire item. It does not put individual attributes.
DynoAbstract.prototype.putItem = function(itemName, timestamp, item, callback) {
    var self = this;
    self._putOperation('putItem', itemName, timestamp, item, callback);
};

// delItem(itemName, timestamp, callback) -> (err)
//
// This makes sure that all attrs in the item are deleted.
DynoAbstract.prototype.delItem = function(itemName, timestamp, callback) {
    var self = this;
    self._putOperation('delItem', itemName, timestamp, {}, callback);
};

// set(itemName, timestamp, obj, callback) -> (err)
//
// This replaces just the attributes given in the item specified.
DynoAbstract.prototype.set = function(itemName, timestamp, obj, callback) {
    var self = this;
    self._putOperation('set', itemName, timestamp, obj, callback);
};

// del(itemName, timestamp, attrNames, callback) -> (err)
//
// This makes sure that all attrs in the item are deleted.
DynoAbstract.prototype.del = function(itemName, timestamp, attrNames, callback) {
    var self = this;
    self._putOperation('del', itemName, timestamp, attrNames, callback);
};

// inc(itemName, timestamp, attrName, callback) -> (err)
//
// This increments the attribute, or sets it to 1 if it doesn't yet exist.
DynoAbstract.prototype.inc = function(itemName, timestamp, attrName, callback) {
    var self = this;
    self._putOperation('inc', itemName, timestamp, { attrName : attrName, by : 1 }, callback);
};

// incBy(itemName, timestamp, attrName, by, callback) -> (err)
//
// This increments the attribute, or sets it to 'by' if it doesn't yet exist.
DynoAbstract.prototype.incBy = function(itemName, timestamp, attrName, by, callback) {
    var self = this;
    // ToDo: check 'by' is a number
    self._putOperation('inc', itemName, timestamp, { attrName : attrName, by : by }, callback);
};

// dec(itemName, timestamp, attrName, callback) -> (err)
//
// This decrements the attribute, or sets it to -1 if it doesn't yet exist.
DynoAbstract.prototype.dec = function(itemName, timestamp, attrName, callback) {
    var self = this;
    self._putOperation('inc', itemName, timestamp, { attrName : attrName, by : -1 }, callback);
};

// decBy(itemName, timestamp, attrName, callback) -> (err)
//
// This decrements the attribute, or sets it to -by if it doesn't yet exist.
DynoAbstract.prototype.decBy = function(itemName, timestamp, attrName, by, callback) {
    var self = this;
    // ToDo: check 'by' is a number
    self._putOperation('inc', itemName, timestamp, { attrName : attrName, by : -by }, callback);
};

// append(itemName, timestamp, attrName, str, callback) -> (err)
//
// This appends the 'str' to the attribute.
DynoAbstract.prototype.append = function(itemName, timestamp, attrName, str, callback) {
    var self = this;
    self._putOperation('append', itemName, timestamp, { attrName : attrName, str : str }, callback);
};

// (itemName, timestamp, attrName, value, callback) -> (err)
//
// This adds the value to the item's attr set.
DynoAbstract.prototype.addToSet = function(itemName, timestamp, attrName, value, callback) {
    var self = this;
    self._putOperation('addToSet', itemName, timestamp, { attrName : attrName, value : value }, callback);
};

// ----------------------------------------------------------------------------

// flatten(itemName, hash) -> (err)
//
// This gets out all of the changes for this itemName and instruments them with
// their changes and hashes. It then loops through each one and checks to see if
// it correlates with the hash provided.
//
// At this point it replaces the history up to this point with flattened history
// operation.
//
// If we run through the entire item's history and we never find the hash
// then we'll return an error.
DynoAbstract.prototype.flatten = function(itemName, flattenToHash, callback) {
    var self = this;

    console.log('flatten(): entry - hash=' + flattenToHash);

    // firstly, get the history
    self._getChangesets(itemName, function(err, changesets) {
        if (err) return callback(err);

        // instrument the changesets with their meta data
        changesets = self.instrumentChangesets(changesets);

        // now loop through finding the hash
        var upto;
        changesets.forEach(function(changeset, i) {
            if ( changeset.hash === flattenToHash ) {
                upto = i;
            }
        });
        console.log('Found hash at position ' + upto);
        callback(null, upto);
    });
};

// ----------------------------------------------------------------------------

// getItem(name) -> (err, item)
//
// This gets the item and returns it. It reads *all* of the actions that have happened so far
// and runs through them, making up the final item, which it returns.
DynoAbstract.prototype.getItem = function(name, callback) {
    var self = this;

    console.log('Getting ' + name + ' ...');

    self._getChangesets(name, function(err, changesets) {
        if (err) return callback(err);

        if ( typeof changesets === 'undefined' ) {
            return callback(null, {});
        }

        console.log('changesets:', changesets);

        // reduce the changesets into the item (which is essentially the _last_ changeset)
        var item = self.reduce(changesets);
        console.log('getItem(): item:', item);

        callback(null, item);
    });
};

// getHistory(name) -> (err, changesets)
//
// This gets the item and returns the changesets instead of reducing into an item.
DynoAbstract.prototype.getHistory = function(name, callback) {
    var self = this;
    console.log('Getting changesets for ' + name + ' ...');
    self._getChangesets(name, callback);
};

// ----------------------------------------------------------------------------

// export the abstract baseclass
module.exports = exports = DynoAbstract;

// ----------------------------------------------------------------------------
