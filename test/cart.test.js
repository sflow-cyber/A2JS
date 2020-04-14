import { validateHtml } from './jest-tuwien/validate.js';
import { chance } from './jest-tuwien/chance.js';
import { calculatePrice } from '../www/frame.js';

const PAGE_URL = 'http://localhost:4444/cart.html';
const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/';

async function setCart(cart) {
    await page.evaluate((cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, cart);
    await page.reload({ waitUntil: 'networkidle0' });
}

describe('Shopping Cart', () => {
    validateHtml('../www/cart.html');
});

describe('Shopping Cart', () => {
    beforeEach(async () => {
        await jestPuppeteer.resetBrowser();
        await page.setRequestInterception(true);
        page.on('request', req => {
            req.continue({ url: req.url().replace(MET_BASE_URL, 'http://localhost:4445/') });
        });
        await page.setViewport({ width: 1024, height: 768 });
    });

    it(`shows empty message`, async () => {
        await page.goto(PAGE_URL);
        await expect(page).toMatch('There are no items in your shopping cart.');
        const disabled = await page.evaluate(() => {
            return document.getElementById('checkout-button').disabled;
        });
        expect(disabled).toBe(true);
    });

    it('displays items', async () => {
        await page.goto(PAGE_URL);
        const cart = chance.n(chance.cartItem, 3);        
        for (let i = 0; i < 3; i++) { cart[i].objectID = i+1; }
        await setCart(cart);
        await expect(page).toMatch('Vincent van Gogh');
        await expect(page).toMatch('Madame Roulin and Her Baby, 1888');
        await expect(page).toMatch('Shoes, 1888');
        await expect(page).toMatch('Wheat Field with Cypresses, 1889');
        const imgs = await page.evaluate(() => {            
            return Array.from(document.getElementsByTagName('img')).map(e => e.src.split('/').pop());
        });
        expect(imgs).toContainEqual('DT3154.jpg');
        expect(imgs).toContainEqual('DT1947.jpg');
        expect(imgs).toContainEqual('DT1567.jpg');
    });

    it('items display textual frame descriptions', async () => {
        await page.goto(PAGE_URL);
        const cart = [
            {
                objectID: chance.objectID(),
                printSize: 'L', 
                frameWidth: 27, 
                frameStyle: 'classic', 
                matWidth: 31, 
                matColor: 'indigo'
            },
            {
                objectID: chance.objectID(),
                printSize: 'S', 
                frameWidth: 20, 
                frameStyle: 'shabby', 
                matWidth: 0
            }
        ];
        await setCart(cart);
        await expect(page).toMatch('Large print in a 2.7 cm classic frame with a 3.1 cm indigo mat.');
        await expect(page).toMatch('Small print in a 2 cm shabby frame.');
    });

    it('items link to configurator', async () => {
        await page.goto(PAGE_URL);
        const cart = chance.n(chance.cartItem, 5);
        await setCart(cart);

        const hrefs = await page.evaluate(() => {
            return Array.from(document.getElementsByTagName('a')).map(a => a.href);
        });
        const urls = hrefs.map(href => new URL(href)).filter(url => url.pathname == '/config.html');
        for (const item of cart) {
            let match = false;
            for (const url of urls) {
                if (url.searchParams.get('objectID') == item.objectID &&
                    url.searchParams.get('printSize') == item.printSize &&
                    url.searchParams.get('frameStyle') == item.frameStyle &&
                    url.searchParams.get('frameWidth') == item.frameWidth &&
                    url.searchParams.get('matColor') == item.matColor &&
                    url.searchParams.get('matWidth') == item.matWidth) {
                    match = true;
                    break;
                }
            }
            expect(match).toBe(true);
        }
    });

    it('displays correct total price', async () => {
        await page.goto(PAGE_URL);
        const cart = chance.n(chance.cartItem, 5);
        await setCart(cart);
        let expectedTotal = 0;
        for (const item of cart) {
            expectedTotal += calculatePrice(item.printSize, item.frameStyle, item.frameWidth, item.matWidth);
        }
        const totalPrice = await page.evaluate(() => {
            return document.getElementById('price-total').innerHTML;
        });
        expect(parseFloat(totalPrice).toFixed(2)).toEqual(expectedTotal.toFixed(2));
    });

    it('removes items correctly', async () => {
        await page.goto(PAGE_URL);
        const cart = chance.n(chance.cartItem, 5);
        await setCart(cart);
        const n = chance.integer({min: 1, max: cart.length});
        await page.click(`#cart > div:nth-child(${n}) .cart-remove`);
        const cart2 = await page.evaluate(() => {
            return JSON.parse(localStorage.getItem('cart'));
        });
        expect(cart2).toHaveLength(cart.length - 1);
        expect(cart2).not.toContainEqual(cart[cart.length - n]);
    });

    it('caches Met objects', async () => {
        const cart = chance.n(chance.cartItem, 3);

        const requestedObjects = new Set();
        page.on('request', req => {
            if (req.url().startsWith(MET_BASE_URL + 'objects/')) {
                const objectID = parseInt(req.url().substring((MET_BASE_URL + 'objects/').length));
                requestedObjects.add(objectID);
            }
        });
        await page.goto(PAGE_URL);
        await setCart(cart);        
        expect(requestedObjects).toEqual(new Set(cart.map(item => item.objectID)));
        requestedObjects.clear();

        await page.reload({ waitUntil: 'networkidle0' });
        expect(requestedObjects).toEqual(new Set());
    });    

    it('shows correct number of cart items', async () => {
        await page.goto(PAGE_URL);
        const cart = chance.n(chance.cartItem, chance.integer({min: 1, max: 10}));
        await setCart(cart);        
        await expect(page).toMatch(`Cart (${cart.length})`);
        
        await setCart([]);
        await expect(page).toMatch('Cart');
        await expect(page).not.toMatch('Cart (0)');
    });

});