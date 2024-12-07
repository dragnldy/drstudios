(function () {
    // This code exists to support access to locally persisted data for the app. It provides convenient access to
    // the browser's IndexedDB APIs, along with a preconfigured database structure.

    let CURRENT_VERSION = 1;
    let DATABASE_NAME = "Meter Reading";
    const db = idb.openDB(DATABASE_NAME, CURRENT_VERSION, {
        upgrade(db) {
            db.createObjectStore("version", { keyPath: "CommunityId" });
            db.createObjectStore("community", { keyPath: "Id" });
            db.createObjectStore("wells", { keyPath: "Id" });
            db.createObjectStore("households", { keyPath: "Id" });
            db.createObjectStore("meters", { keyPath: "Id" });
            db.createObjectStore("welluse", { keyPath: "Id" });
            db.createObjectStore("readtasks", { keyPath: "WaterMeterId" })
        },
    });

    window.indexedDbStore = {
        get: async (storeName, key) => (await db).transaction(storeName).store.get(key),
        getAll: async (storeName) => (await db).transaction(storeName).store.getAll(),
        getFirstFromIndex: async (storeName, indexName, direction) => {
            const cursor = await (await db).transaction(storeName).store.index(indexName).openCursor(null, direction);
            return (cursor && cursor.value) || null;
        },
        put: async (storeName, key, value) => (await db).transaction(storeName, 'readwrite').store.put(value, key === null ? undefined : key),
        putAllFromJson: async (storeName, json) => {
            const store = (await db).transaction(storeName, 'readwrite').store;
            JSON.parse(json).forEach(item => store.put(item));
        },
//        deleteDb: async () => (await db).transaction().deleteDB("Meter Reading"),
        delete: async (storeName, key) => (await db).transaction(storeName, 'readwrite').store.delete(key),
        autocompleteKeys: async (storeName, text, maxResults) => {
            const results = [];
            let cursor = await (await db).transaction(storeName).store.openCursor(IDBKeyRange.bound(text, text + '\uffff'));
            while (cursor && results.length < maxResults) {
                results.push(cursor.key);
                cursor = await cursor.continue();
            }
            return results;
        }
    };
})();