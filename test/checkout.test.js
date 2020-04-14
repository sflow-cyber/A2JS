import { validateHtml } from './jest-tuwien/validate.js';
import { chance } from './jest-tuwien/chance.js';
import { calculatePrice } from '../www/frame.js';

const PAGE_URL = 'http://localhost:4444/checkout.html';
const ARTMART_BASE_URL = 'https://web-engineering.big.tuwien.ac.at/s20/a2/';
const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/';

async function setCart(cart) {
    await page.evaluate((cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, cart);
    await page.reload({ waitUntil: 'networkidle0' });
}

describe('Checkout', () => {
    validateHtml('../www/checkout.html');
});

describe('Checkout', () => {

    const destinations = chance.n(chance.shippingDestination, 5);

    beforeEach(async () => {
        await jestPuppeteer.resetBrowser();
        await page.setRequestInterception(true);
        page.on('request', req => {
            if (req.url() == ARTMART_BASE_URL + 'shipping') {
                req.respond({
                    contentType: 'application/json',
                    body: JSON.stringify({ destinations: destinations })
                });
            } else {
                req.continue({ url: req.url().replace(MET_BASE_URL, 'http://localhost:4445/') });
            }
        });
        await page.setViewport({ width: 1024, height: 768 });
    });

    it('redirects if cart is empty', async () => {
        await page.goto(PAGE_URL);
        await page.waitFor(() => {
            return document.location.href.includes('cart.html');
        }, { timeout: 1000 });
        expect(page.url()).toEqual(expect.stringMatching(/cart.html/));
    });

    it('uses the shipping API', async () => {
        await page.goto(PAGE_URL);
        await setCart([chance.cartItem()]);
        await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
        const countries = await page.evaluate(() => {
            return Array.from(document.getElementById('country').options).map(o => o.text);
        });
        expect(countries).toEqual(destinations.map(d => d.displayName));
    });

    it('shows the correct subtotal', async () => {
        await page.goto(PAGE_URL);
        const cart = chance.n(chance.cartItem, 5);
        await setCart(cart);
        await page.goto(PAGE_URL);
        let expectedSubtotal = 0;
        for (const item of cart) {
            expectedSubtotal += calculatePrice(item.printSize, item.frameStyle, item.frameWidth, item.matWidth);
        }
        const subtotal = await page.evaluate(() => {
            return document.getElementById('price-subtotal').innerHTML;
        });
        expect(parseFloat(subtotal)).toEqual(expectedSubtotal);
    });

    it('calculates shipping costs correctly', async () => {
        await page.goto(PAGE_URL);
        const cart = chance.n(chance.cartItem, 3);
        await setCart(cart);
        await page.goto(PAGE_URL);
        for (const dest of destinations) {
            await page.select('#country', dest.country);
            await expect(page).toMatch('Shipping Costs: € ' + (dest.cost / 100).toFixed(2));
        }
    });

    it('shows the correct total', async () => {
        await page.goto(PAGE_URL);
        const cart = chance.n(chance.cartItem, 3);
        await setCart(cart);
        await page.goto(PAGE_URL);
        let subtotal = 0;
        for (const item of cart) {
            subtotal += calculatePrice(item.printSize, item.frameStyle, item.frameWidth, item.matWidth);
        }
        const dest = chance.pickone(destinations);
        await page.select('#country', dest.country);

        let expectedTotal = subtotal + (dest.cost / 100);
        await expect(page).toMatch('Total: € ' + expectedTotal);
    });

});

describe('Checkout', () => {

    beforeEach(async () => {
        await jestPuppeteer.resetBrowser();
        await page.setRequestInterception(true);
        page.on('request', req => {
            if (req.url() == ARTMART_BASE_URL + 'shipping') {
                req.abort();
            } else {
                req.continue({ url: req.url().replace(MET_BASE_URL, 'http://localhost:4445/') });
            }
        });
    });

    it('gracefully handles shipping API errors', async () => {
        await page.goto(PAGE_URL);
        const cart = chance.n(chance.cartItem, 5);
        await setCart(cart);
        await page.goto(PAGE_URL);
        await expect(page).toMatch('Shipping Costs: € \u2014');
        await expect(page).toMatch('Total: € \u2014');
    });

});