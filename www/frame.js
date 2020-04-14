/**
 * Calculates the possible print sizes for an image.
 *
 * @param img An Image object. Note: if the image is not fully loaded yet, results might be unexpected.
 * @returns A dictionary with fitting sizes for small, medium and large prints.
 *          The keys are 'S', 'M' and 'L' and the entries are two-element arrays [w,h] of width and height.
 */
export function getPrintSizes(img) {
    let S = [297, 297]; // A4
    let M = [420, 420]; // A3
    let L = [594, 594]; // A2

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    if (h > w) {
        S[0] = Math.floor(w * S[1] / h);
        M[0] = Math.floor(w * M[1] / h);
        L[0] = Math.floor(w * L[1] / h);
    } else {
        S[1] = Math.floor(h * S[0] / w);
        M[1] = Math.floor(h * M[0] / w);
        L[1] = Math.floor(h * L[0] / w);
    }

    return { S: S, M: M, L: L };
}

/**
 * Renders an image within a given square container as a print of a certain size, with a frame and a mat.
 *
 * @param img An Image object. Note: if the image is not fully loaded yet, results might be unexpected.
 * @param container The object that contains the Image.
 * @param printSize The size of the print, either 'S', 'M' or 'L'.
 * @param frameStyle The type of frame, as a string.
 * @param frameWidth The width of the frame, in millimeters.
 * @param matColor The color of the mat, as a string.
 * @param matWidth The width of the mat, in millimeters.
 */
export function render(img, container, printSize, frameStyle, frameWidth, matColor, matWidth) {
    const printSizes = getPrintSizes(img);
    const w = printSizes[printSize][0];
    const h = printSizes[printSize][1];

    let x;
    if (w > h) {
        x = container.offsetWidth / (w + 2 * matWidth + 2 * frameWidth);
    } else {
        x = container.offsetHeight / (h + 2 * matWidth + 2 * frameWidth);
    }

    const frameImageSlices = {
        classic: 115,
        natural: 75,
        shabby: 120,
        elegant: 107
    };

    const matColors = {
        ivory: '#fffff0',
        mint: '#e0e6d4',
        wine: '#50222d',
        indigo: '#29434c',
        coal: '#333a3d',
    };

    img.style.boxSizing = 'border-box';
    img.width = (w + 2 * matWidth + 2 * frameWidth) * x;
    img.height = (h + 2 * matWidth + 2 * frameWidth) * x;
    img.style.borderImageSource = `url(frame-styles/${frameStyle}.jpg)`;
    img.style.borderImageSlice = frameImageSlices[frameStyle];
    img.style.borderWidth = `${frameWidth * x}px`;
    img.style.backgroundColor = matColors[matColor];
    img.style.padding = `${matWidth * x}px`;
}

/**
 * Returns the price of a given frame configuration in euros, 
 * as a floating point number rounded to two decimal places.
 * 
 * @param printSize The size of the print, either 'S', 'M' or 'L'.
 * @param frameStyle The type of frame, as a string.
 * @param frameWidth The width of the frame, in millimeters.
 * @param matWidth The width of the mat, in millimeters.
 */
export function calculatePrice(printSize, frameStyle, frameWidth, matWidth) {
    let price = 0.0;
    // TODO: implement this function
    return (Math.round((price + Number.EPSILON) * 100) / 100);
}

export function onPageLoad() {
    const parts = window.location.href.split("?objectID=");
    if (parts.length > 1) {
        determineArtwork(parts[1]);
        connectSliderTextfield();
    } else {
        window.location.href = "search.html";
    }
}

/**
 * Use a query parameter objectID to determine which artwork 
 * is being configured on the page. If the requested picture 
 * does not exist, the user should be redirected to the Search 
 * page.
 *
 */
export async function determineArtwork(objectID) {
    const artWorkUrl = "https://collectionapi.metmuseum.org/public/collection/v1/objects/" + objectID;
    try {
        const response = await fetch(artWorkUrl, {method: 'GET'});
        const artworks = await response.json();
        if (artworks.primaryImageSmall.length == 0) {
            // redirect to search page
            window.location.href = "search.html";
        }
        document.getElementById("preview-image").src = artworks.primaryImageSmall;
        const info = `<b>${artworks.artistDisplayName}</b><br><i>${artworks.title}</i>, ${artworks.accessionYear}`;
        document.getElementById("image-label").innerHTML = info;
    } catch(e) {
        window.location.href = "search.html";
    }
}

/**
 * Connect the frame width and mat width text fields 
 * with their respective range sliders, so that changing 
 * the value of the slider changes the value in the text 
 * field, and vice versa.
 * 
 * Ensure that only valid values can be entered for 
 * frame and mat width. The frame width can range from 
 * 2–5 cm and the mat width from 0–10 cm, both with 
 * 10 mm steps.
 * 
 */

export function connectSliderTextfield() {
    const frameWidthTF = document.getElementById("frameWidth");
    const frameWidthSlid = document.getElementById("frameWidthR");
    const matTF = document.getElementById("matWidth");
    const matSlid = document.getElementById("matWidthR");

    frameWidthSlid.oninput = function() {
        frameWidthTF.value = this.value;
    }

    matSlid.oninput = function() {
        matTF.value = this.value;
    }

    frameWidthTF.oninput = function() {
        if (this.value.length == 0) return;
        if (isNaN(this.value)) return;
        let tfVal = parseFloat(parseInt(Math.round(this.value * 10))) / 10;
        tfVal = Math.min(5, tfVal);
        tfVal = Math.max(2, tfVal);
        frameWidthSlid.value = tfVal;
        this.value = tfVal;
    }

    matTF.oninput = function() {
        if (this.value.length == 0) return;
        if (isNaN(this.value)) return;
        let tfVal = parseFloat(parseInt(Math.round(this.value * 10))) / 10;
        tfVal = Math.min(10, tfVal);
        tfVal = Math.max(0, tfVal);
        matSlid.value = tfVal;
        this.value = tfVal;
    }

    frameWidthTF.onkeypress = function(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.blur();
            if (this.value.length == 0) {
                this.value = frameWidthSlid.value;
            }
        }
    } 

    matTF.onkeypress = function(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.blur();
            if (this.value.length == 0) {
                this.value = matSlid.value;
            }
        }
    }

}
	