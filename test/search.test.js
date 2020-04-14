import { validateHtml } from './jest-tuwien/validate.js';
import { chance } from './jest-tuwien/chance.js';

const PAGE_URL = 'http://localhost:4444/search.html';
const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/';

// TODO: load highlights from file
const highlights = [39799, 459055, 437853, 435809, 436535, 360018, 634108, 459080, 435882, 271890, 459054, 436105];

async function setCart(cart) {
    await page.evaluate((cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, cart);
    await page.reload({ waitUntil: 'networkidle0' });
}

describe('Search', () => {
    validateHtml('../www/search.html');
});

describe('Search', () => {
    beforeEach(async () => {
        await jestPuppeteer.resetBrowser();
        await page.setRequestInterception(true);
        page.on('request', req => {
            req.continue({ url: req.url().replace(MET_BASE_URL, 'http://localhost:4445/') });
        });
        await page.setViewport({ width: 1024, height: 768 });
    });

    it('works via query parameter', async () => {
        await page.goto(PAGE_URL + '?q=van+gogh');
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

    it('works via search field', async () => {
        await page.goto(PAGE_URL);
        await page.type('#search', 'van+gogh');
        await Promise.all([
            page.click('#search-button'),
            page.waitForNavigation({ timeout: 1000 })
        ]);
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

    it('displays the correct text while searching', async () => {
        let tempSearchText = null;
        page.on('request', async req => {
            if (req.url().startsWith(MET_BASE_URL + 'search')) {
                tempSearchText = await page.evaluate(() => {
                    return document.getElementById('search-info').innerHTML;
                });
            }
        });
        await page.goto(PAGE_URL + '?q=foobar', { waitUntil: 'networkidle0' });
        expect(tempSearchText).toBe('Searching for “foobar”...');
    });

    it('displays the correct text when the search is done', async () => {
        await page.goto(PAGE_URL + '?q=van+gogh');
        await expect(page).toMatch('Found 3 artworks for “van gogh”');
        await page.goto(PAGE_URL + '?q=one');
        await expect(page).toMatch('Found 1 artwork for “one”');
        await page.goto(PAGE_URL + '?q=none');
        await expect(page).toMatch('Found 0 artworks for “none”');
        await page.goto(PAGE_URL + '?q=null');
        await expect(page).toMatch('Found 0 artworks for “null”');
    });

    it('considers only artworks that actually have images', async () => {
        let usesHasImages = false;
        page.on('request', req => {
            if (req.url().startsWith(MET_BASE_URL + 'search')) {
                usesHasImages = /hasImages=true/.test(req.url());
            }
        });
        await page.goto(PAGE_URL + '?q=foobar');
        expect(usesHasImages).toBe(true);
    });

    it('displays no more than 100 results', async () => {
        await page.goto(PAGE_URL + '?q=many', { waitUntil: 'networkidle0' });
        const museumLabels = await page.evaluate(() => {
            return Array.from(document.getElementsByClassName('museum-label'));
        });
        expect(museumLabels.length).toBe(100);
    });

    it('displays a selection of highlights if no search term was given', async () => {
        const requestedObjects = new Set();
        page.on('request', req => {
            if (req.url().startsWith(MET_BASE_URL + 'objects/')) {
                const objectID = parseInt(req.url().substring((MET_BASE_URL + 'objects/').length));
                requestedObjects.add(objectID);
            }
        });

        await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });
        expect(requestedObjects).toEqual(new Set(highlights));
    });

    it('displays the right text if no search term was given', async () => {
        await page.goto(PAGE_URL);
        await expect(page).toMatch('Search our collection of more than 400,000 artworks.');
    });

    it('caches Met objects', async () => {
        await page.goto(PAGE_URL, { waitUntil: 'networkidle0' });

        const requestedObjects = new Set();
        page.on('request', req => {
            if (req.url().startsWith(MET_BASE_URL + 'objects/')) {
                const objectID = parseInt(req.url().substring((MET_BASE_URL + 'objects/').length));
                requestedObjects.add(objectID);
            }
        });

        await page.goto(PAGE_URL + '?q=van+gogh', { waitUntil: 'networkidle0' });
        expect(requestedObjects).toEqual(new Set([1, 2, 3]));
        requestedObjects.clear();

        await page.goto(PAGE_URL + '?q=van+gogh', { waitUntil: 'networkidle0' });
        expect(requestedObjects).toEqual(new Set());
    });

    it('shows correct number of cart items', async () => {
        await page.goto(PAGE_URL);
        const cart = chance.n(chance.cartItem, chance.integer({ min: 1, max: 10 }));
        await setCart(cart);
        await expect(page).toMatch(`Cart (${cart.length})`);

        await setCart([]);
        await expect(page).toMatch('Cart');
        await expect(page).not.toMatch('Cart (0)');
    });

});
