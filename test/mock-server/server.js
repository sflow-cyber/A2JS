const express = require('express');
const path = require('path');
const Chance = require('chance');

const app = express();
const port = process.argv[2];

app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/objects/0', (req, res) => {
    res.status(404).send({message: "ObjectID not found"});
});

app.get('/objects/:objectID', (req, res) => {
    const objectID = parseInt(req.params.objectID);
    const chance = new Chance(objectID);
    let object;
    switch (objectID) {
        case 1:
            object = {
                objectID: 1,
                primaryImageSmall: `http://localhost:${port}/images/DT3154.jpg`,
                title: 'Madame Roulin and Her Baby',
                artistDisplayName: 'Vincent van Gogh',
                objectDate: '1888'
            };
            break;
        case 2:
            object = {
                objectID: 2,
                primaryImageSmall: `http://localhost:${port}/images/DT1947.jpg`,
                title: 'Shoes',
                artistDisplayName: 'Vincent van Gogh',
                objectDate: '1888'
            };
            break;
        case 3:
            object = {
                objectID: 3,
                primaryImageSmall: `http://localhost:${port}/images/DT1567.jpg`,
                title: 'Wheat Field with Cypresses',
                artistDisplayName: 'Vincent van Gogh',
                objectDate: '1889'
            };
            break;
        default:
            object = {
                objectID: objectID,
                primaryImageSmall: `http://localhost:${port}/images/` + chance.pickone(['test.jpg', 'we.jpg', 'js.jpg']),
                title: chance.sentence({ words: chance.integer({ min: 1, max: 10 }), punctuation: false }),
                artistDisplayName: chance.name({ middle: chance.bool() }),
                objectDate: chance.year({ min: 1400, max: 2020 }).toString()
            };
            break;
    }
    res.send(object);
});

app.get('/search', (req, res) => {
    const q = req.query.q;
    const chance = new Chance(q);
    let objectIDs;
    switch (q) {
        case 'null':
            res.send({total: 0, objectIDs: null});
            return;
        case 'none':
            objectIDs = [];
            break;
        case 'one':
            objectIDs = [1];
            break;
        case 'many':
            objectIDs = chance.unique(chance.integer, 342, { min: 4, max: 1000000 });
            break;
        case 'van gogh':
            objectIDs = [1, 2, 3];
            break;
        default:
            objectIDs = chance.unique(chance.integer, chance.integer({ min: 1, max: 10 }), { min: 4, max: 1000000 });
            break;
    }
    res.send({ total: objectIDs.length, objectIDs: objectIDs });
});

app.use((req, res, next) => {
    res.status(404).end();
});

app.listen(port);
