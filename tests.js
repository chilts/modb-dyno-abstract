module.exports = function(newDynoFn) {

    // give each test a new instance of a Dyno

    // items
    require('./test/getItem.js')(newDynoFn());
    require('./test/delItem.js')(newDynoFn());

    // attributes
    require('./test/set.js')(newDynoFn());
    require('./test/add.js')(newDynoFn());
    require('./test/append.js')(newDynoFn());
    require('./test/del.js')(newDynoFn());
    require('./test/sets.js')(newDynoFn());

    // history
    require('./test/history.js')(newDynoFn());
    require('./test/history-not-yet-flattened.js')(newDynoFn());

    // flattening items
    require('./test/flatten-one.js')(newDynoFn());
    require('./test/flatten-unchanged.js')(newDynoFn());
    require('./test/flatten-twice.js')(newDynoFn());
    require('./test/flatten-two.js')(newDynoFn());
    require('./test/flatten-three.js')(newDynoFn());

    // queries and scans
    require('./test/query.js')(newDynoFn());
    require('./test/scan.js')(newDynoFn());
};
