const Chance = require('chance');
const chance = new Chance(__SEED__);
chance.mixin({
    'objectID': function () {
        return chance.integer({ min: 1, max: 1000000 });
    },
    'printSize': function () {
        return chance.pickone(['S', 'M', 'L']);
    },
    'matColor': function () {
        return chance.pickone(['ivory', 'mint', 'wine', 'indigo', 'coal']);
    },
    'frameStyle': function () {
        return chance.pickone(['classic', 'natural', 'shabby', 'elegant']);
    },
    'frameWidth': function () {
        return chance.floating({ min: 2, max: 5, fixed: 1 });
    },
    'matWidth': function () {
        return chance.floating({ min: 0, max: 10, fixed: 1 });
    },
    'cartItem': function () {
        return {
            objectID: chance.objectID(),
            printSize: chance.printSize(),
            frameStyle: chance.frameStyle(),
            frameWidth: chance.frameWidth() * 10,
            matColor: chance.matColor(),
            matWidth: chance.matWidth() * 10
        };
    },
    'shippingDestination': function () {
        return {
            country: chance.country(),
            displayName: chance.word({syllables: 5, capitalize: true}),
            cost: chance.integer({min: 100, max: 10000})
        }
    }
});

module.exports = { chance };