# dyno-abstract #

The abstract base class for all your [dyno](https://github.com/chilts/dyno/) storage engines.

Current implementations are:

* [dyno-memory](https://github.com/chilts/dyno-memory/)
* [dyno-leveldb](https://github.com/chilts/dyno-leveldb/)
* [dyno-redis](https://github.com/chilts/dyno-redis/)
* [dyno-memory](https://github.com/chilts/dyno-memory/)
* [dyno-pg](https://github.com/chilts/dyno-pg/)

## Changesets ##

Most operations are regular operations and look like the following:

```
[
    {
        name      : "chilts",
        operation : "putItem",
        timestamp : "2013-04-07T06:32:04.233Z",
        change    : {
            email  : "chilts@example.com",
            logins : 27,
            id     : "b499b06c-42a1-4b23-9cff-60bc359f8085"
        },
    },
    {
        name      : "chilts",
        operation : "putAttrs",
        timestamp : "2013-04-07T06:37:01.872Z",
        change    : {
            admin  : true,
        },
    },
]
```

However, there is a special operation called "history" which looks slightly different:

```
{
    name      : "chilts",
    operation : "history",
    timestamp : "2013-04-07T06:37:01.872Z",
    value     : {
        email  : "chilts@example.com",
        admin  : true,
        logins : 27,
        id     : "b499b06c-42a1-4b23-9cff-60bc359f8085"
    },
    changes   : 2,
    hash      : "acc112f0b8e451174e143f9210d9d6eb",
}
```

As you can see, this changeset does not have a ```change```, but instead has a ```value```. That's because we know the
proper value of this item at this stage in time. This single ```history``` operation has replaced both of the regular
operations above. Therefore, it also contains ```changes``` (which is set to 2) and ```hash``` which is set to a hash
of the entire history of this item.

## Hash ##

Please see https://github.com/chilts/dyno-leveldb/ for an introduction to hashes.

(Ends)
