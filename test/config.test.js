import { validateHtml } from './jest-tuwien/validate.js';
import { chance } from './jest-tuwien/chance.js';

const PAGE_URL = 'http://localhost:4444/config.html';
const MET_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/';

async function setCart(cart) {
    await page.evaluate((cart) => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, cart);
    await page.reload({ waitUntil: 'networkidle0' });
}

async function setInputValue(name, value) {
    await page.click(`input[name=${name}]`, { clickCount: 3 });
    await page.keyboard.type(value);
    await page.click('body');
}

async function getInputValue(name) {
    const v = await page.evaluate((name) => {
        return document.querySelector(`input[name=${name}]`).value;
    }, name);
    return v;
}

async function getSelectedRadioValue(name) {
    const v = await page.evaluate((name) => {
        return document.querySelector(`input[name=${name}]:checked`).value;
    }, name);
    return v;
}

describe('Frame Configurator', () => {
    validateHtml('../www/config.html');
});

describe('Frame Configurator', () => {
    beforeEach(async () => {
        await jestPuppeteer.resetBrowser();
        await page.setRequestInterception(true);
        page.on('request', req => {
            req.continue({ url: req.url().replace(MET_BASE_URL, 'http://localhost:4445/') });
        });
        await page.setViewport({ width: 1024, height: 768 });
    });

    it('loads the correct artwork', async () => {
        await page.goto(PAGE_URL + '?objectID=2', { waitUntil: 'networkidle0' });
        await expect(page).toMatch('Vincent van Gogh');
        await expect(page).toMatch('Shoes');
        await expect(page).toMatch('1888');
        const imgSrc = await page.evaluate(() => {
            return document.getElementById('preview-image').src;
        });
        expect(imgSrc).toEqual(expect.stringMatching(/DT1947.jpg/));
    });

    it('redirects if no object ID given', async () => {
        await page.goto(PAGE_URL);
        await page.waitFor(() => {
            return document.location.href.includes('search.html');
        }, { timeout: 1000 });
        expect(page.url()).toEqual(expect.stringMatching(/search.html/));
    });

    it('redirects if object does not exist', async () => {
        await page.goto(PAGE_URL + '?objectID=0');
        await page.waitFor(() => {
            return document.location.href.includes('search.html');
        }, { timeout: 1000 });
        expect(page.url()).toEqual(expect.stringMatching(/search.html/));
    });

    it('accepts query parameters to set values', async () => {
        for (let i = 0; i < 10; i++) {
            const oid = chance.objectID();
            const printSize = chance.printSize();
            const frameWidth = chance.frameWidth();
            const frameStyle = chance.frameStyle();
            const matWidth = chance.matWidth();
            const matColor = chance.matColor();
            await page.goto(PAGE_URL + `?objectID=${oid}&printSize=${printSize}&frameWidth=${frameWidth * 10}&frameStyle=${frameStyle}&matWidth=${matWidth * 10}&matColor=${matColor}`);
            await expect(getSelectedRadioValue('printSize')).resolves.toEqual(printSize);
            await expect(getSelectedRadioValue('frameStyle')).resolves.toEqual(frameStyle);
            await expect(getInputValue('frameWidth')).resolves.toEqual(frameWidth.toString());
            await expect(getInputValue('matWidth')).resolves.toEqual(matWidth.toString());
            await expect(getSelectedRadioValue('matColor')).resolves.toEqual(matColor);
        }
    });

    it('frame width field is connected to slider', async () => {
        const oid = chance.objectID();
        await page.goto(PAGE_URL + '?objectID=' + oid);
        for (let i = 0; i < 10; i++) {
            const frameWidth = chance.frameWidth().toString();
            await setInputValue('frameWidth', frameWidth);
            await expect(getInputValue('frameWidthR')).resolves.toEqual(frameWidth);
        }
    });

    it('frame width stays within range', async () => {
        const oid = chance.objectID();
        await page.goto(PAGE_URL + '?objectID=' + oid);
        const xs = [['0', '2'], ['1.6', '2'], ['-726425527123967', '2'], ['6', '5'], ['5.1', '5'], ['516193187895707', '5'], ['3.989', '4'], ['1.1786', '2'], ['4.6799', '4.7'], ['2.0649', '2.1'], ['1.8819', '2']];
        for (let x of xs) {
            await setInputValue('frameWidth', x[0]);
            await expect(getInputValue('frameWidth')).resolves.toEqual(x[1]);
            await expect(getInputValue('frameWidthR')).resolves.toEqual(x[1]);
        }
    });

    it('updates preview when configuration changes', async () => {
        const oid = chance.objectID();
        await page.goto(PAGE_URL + '?objectID=' + oid);

        for (let i = 0; i < 5; i++) {
            const printSize = chance.printSize();
            const frameWidth = chance.frameWidth();
            const frameStyle = chance.frameStyle();
            const matWidth = chance.matWidth();
            const matColor = chance.matColor();
            await page.click(`label[for=print-size-${printSize.toLowerCase()}]`);
            await setInputValue('frameWidth', frameWidth.toString());
            await page.click(`label[for=frame-style-${frameStyle}]`);
            await setInputValue('matWidth', matWidth.toString());
            await page.click(`label[for=mat-color-${matColor}]`);
            const style = await page.evaluate(() => {
                return JSON.parse(JSON.stringify(getComputedStyle(document.getElementById('preview-image'))));
            });

            expect(style.borderImageSource).toEqual(expect.stringContaining(frameStyle));

        }
    });

    it('mat width field is connected to slider', async () => {
        const oid = chance.objectID();
        await page.goto(PAGE_URL + '?objectID=' + oid);
        for (let i = 0; i < 10; i++) {
            const matWidth = chance.matWidth().toString();
            await setInputValue('matWidth', matWidth);
            await expect(getInputValue('matWidthR')).resolves.toEqual(matWidth);
        }
    });

    it('mat width stays within range', async () => {
        const oid = chance.objectID();
        await page.goto(PAGE_URL + '?objectID=' + oid);
        const xs = [['-1', '0'], ['-0.1', '0'], ['-702138262591897.6', '0'], ['11', '10'], ['10.1', '10'], ['356131895089567.7', '10'], ['0.3551', '0.4'], ['6.4761', '6.5'], ['5.5552', '5.6'], ['0.076', '0.1'], ['3.1964', '3.2']];
        for (let x of xs) {
            await setInputValue('matWidth', x[0]);
            await expect(getInputValue('matWidth')).resolves.toEqual(x[1]);
            await expect(getInputValue('matWidthR')).resolves.toEqual(x[1]);
        }
    });

    it('calculates price correctly', async () => {
        const oid = chance.objectID();
        await page.goto(PAGE_URL + '?objectID=' + oid);

        const xs = [
            ['S', '5', 'natural', '6', 'mint', '€ 34.30'],
            ['S', '4', 'shabby', '0', 'mint', '€ 33.60'],
            ['S', '3.5', 'elegant', '5.3', 'wine', '€ 33.24'],
            ['M', '4.9', 'natural', '8.2', 'ivory', '€ 68.66'],
            ['M', '4.2', 'natural', '7.9', 'ivory', '€ 67.51'],
            ['S', '3.6', 'elegant', '8.5', 'wine', '€ 33.49'],
            ['L', '3.2', 'classic', '3.7', 'ivory', '€ 116.85'],
            ['L', '4.3', 'natural', '7.8', 'coal', '€ 118.41'],
            ['S', '2.2', 'natural', '3.6', 'wine', '€ 31.94'],
            ['S', '4.3', 'natural', '2.9', 'wine', '€ 33.59']
        ];

        for (const x of xs) {
            await page.click(`label[for=print-size-${x[0].toLowerCase()}]`);
            await setInputValue('frameWidth', x[1]);
            await page.click(`label[for=frame-style-${x[2]}]`);
            await setInputValue('matWidth', x[3]);
            await page.click(`label[for=mat-color-${x[4]}]`);
            const price = await page.evaluate(() => {
                return document.getElementById('price').innerHTML;
            });
            expect(price).toBe(x[5]);
        }
    });

    it('caches Met objects', async () => {
        const oid = chance.objectID();

        const requestedObjects = new Set();
        page.on('request', req => {
            if (req.url().startsWith(MET_BASE_URL + 'objects/')) {
                const objectID = parseInt(req.url().substring((MET_BASE_URL + 'objects/').length));
                requestedObjects.add(objectID);
            }
        });
        await page.goto(PAGE_URL + '?objectID=' + oid, { waitUntil: 'networkidle0' });
        expect(requestedObjects).toEqual(new Set([oid]));
        requestedObjects.clear();

        await page.goto(PAGE_URL + '?objectID=' + oid, { waitUntil: 'networkidle0' });
        expect(requestedObjects).toEqual(new Set());
    });

    it('shows correct number of cart items', async () => {
        const oid = chance.objectID();
        await page.goto(PAGE_URL + '?objectID=' + oid);
        const cart = chance.n(chance.cartItem, chance.integer({ min: 1, max: 10 }));
        await setCart(cart);
        await expect(page).toMatch(`Cart (${cart.length})`);

        await setCart([]);
        await expect(page).toMatch('Cart');
        await expect(page).not.toMatch('Cart (0)');
    });
});