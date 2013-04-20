module.exports = function(newDynoFn) {

    // give each test a new instance of a Dyno

    require('./test/add.js')(newDynoFn());
    require('./test/append.js')(newDynoFn());
    require('./test/delAttrs.js')(newDynoFn());
    require('./test/delItem.js')(newDynoFn());
    require('./test/flatten-one.js')(newDynoFn());
    require('./test/flatten-three.js')(newDynoFn());
    require('./test/flatten-twice.js')(newDynoFn());
    require('./test/flatten-twice-no-changes.js')(newDynoFn());
    require('./test/flatten-two.js')(newDynoFn());
    require('./test/getItem.js')(newDynoFn());
    require('./test/history.js')(newDynoFn());
    require('./test/history-not-yet-flattened.js')(newDynoFn());
    require('./test/putAttrs.js')(newDynoFn());
    require('./test/query.js')(newDynoFn());
    // require('./test/scan.js');
    require('./test/sets.js')(newDynoFn());
};
