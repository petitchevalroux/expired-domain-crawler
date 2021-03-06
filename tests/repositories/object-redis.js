"use strict";
const path = require("path"),
    ObjectRedisRepository = require(path.join(
        __dirname,
        "..",
        "..",
        "src",
        "repositories",
        "object-redis"
    )),
    redis = require("redis-mock"),
    redisClient = redis.createClient(),
    assert = require("assert");

describe("Repositories Object redis", () => {
    const repository = new ObjectRedisRepository({
        namespace: "test-object",
        redisClient: redisClient
    });
    it("store object properties", () => {
        const object = {
            id: "store",
            foo: "bar"
        };
        return repository
            .create(object)
            .then((id) => {
                return repository.fetchById(id);
            })
            .then((readObject) => {
                return assert.deepEqual(readObject, {
                    id: "store",
                    foo: "bar"
                });
            });
    });
    it("update object properties", () => {
        const object = {
            id: "update",
            foo: "bar",
            bool: true,
            "o": {
                "bar": "foo"
            }
        };
        return repository
            .create(object)
            .then(() => {
                return repository
                    .update(object.id, {
                        bar: "foo",
                        foo: "updated"
                    });
            })
            .then((id) => {
                return repository.fetchById(id);
            })
            .then((readObject) => {
                return assert.deepEqual(readObject, {
                    id: "update",
                    foo: "updated",
                    bool: true,
                    o: {
                        bar: "foo"
                    },
                    bar: "foo"
                });
            });
    });

    it("return null when fetching non existing id", () => {
        return repository
            .fetchById(42)
            .then((result) => {
                return assert.equal(result, null);
            });
    });

    it("should not store undefined object properties", () => {
        const object = {
            id: "undefined",
            foo: undefined,
            bar: 1
        };
        return repository
            .create(object)
            .then((id) => {
                return repository.fetchById(id);
            })
            .then((readObject) => {
                return assert.deepEqual(readObject, {
                    id: "undefined",
                    bar: 1
                });
            });
    });


    it("store object normal and zSet properties", () => {
        const repositoryWithZset = new ObjectRedisRepository({
            namespace: "test-object",
            redisClient: redisClient,
            zSetProperties: ["zSetProperty1",
                "zSetProperty2"
            ]
        });
        const object = {
            id: "storeZset",
            foo: "bar",
            zSetProperty1: 1,
            zSetProperty2: 53
        };
        return repositoryWithZset
            .create(object)
            .then((id) => {
                return repositoryWithZset.fetchById(id);
            })
            .then((readObject) => {
                return assert.deepEqual(readObject, {
                    id: "storeZset",
                    foo: "bar",
                    zSetProperty1: 1,
                    zSetProperty2: 53
                });
            });
    });

    it("store object with only zSet properties", () => {
        const repositoryWithZset = new ObjectRedisRepository({
            namespace: "test-object",
            redisClient: redisClient,
            zSetProperties: ["zSetProperty1",
                "zSetProperty2"
            ]
        });
        const object = {
            id: "storeZset2",
            zSetProperty1: 1,
            zSetProperty2: 53
        };
        return repositoryWithZset
            .create(object)
            .then((id) => {
                return repositoryWithZset.fetchById(id);
            })
            .then((readObject) => {
                return assert.deepEqual(readObject, {
                    id: "storeZset2",
                    zSetProperty1: 1,
                    zSetProperty2: 53
                });
            });
    });
});
