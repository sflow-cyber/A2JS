import { CartItem } from './cart-item.js';
import * as Cart from './cart.js';

export var frameRenderObj = {
    img:document.getElementById("preview-image"), 
    container:document.getElementById("preview-container"),
    cartItem: { 
        objectID: null,
        printSize:'M', 
        frameStyle:"natural", 
        frameWidth:40, 
        matColor:"mint", 
        matWidth:55
    }
};

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

export function renderObject() {
    render(frameRenderObj.img, frameRenderObj.container, frameRenderObj.cartItem.printSize, frameRenderObj.cartItem.frameStyle, frameRenderObj.cartItem.frameWidth, frameRenderObj.cartItem.matColor, frameRenderObj.cartItem.matWidth);
    // document.getElementById("preview-image").style.visibility = "visible";
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

/**
 * Use a query parameter objectID to determine which artwork 
 * is being configured on the page. If the requested picture 
 * does not exist, the user should be redirected to the Search 
 * page.
 *
 */
export async function determineArtwork() {
    console.log(frameRenderObj.cartItem.objectID);
    const artWorkUrl = "https://collectionapi.metmuseum.org/public/collection/v1/objects/" + frameRenderObj.cartItem.objectID;
    try {
        const response = await fetch(artWorkUrl, {method: 'GET'});
        const artworks = await response.json();
        if (artworks.primaryImage.length == 0) {
            window.location.href = "search.html";
        }
        const img = document.getElementById("preview-image");
        // img.style.visibility = "hidden";
        img.src = artworks.primaryImage;
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

    frameWidthSlid.addEventListener('input', function() {
        frameWidthTF.value = this.value;
        frameRenderObj.cartItem.frameWidth = this.value * 10;
        renderObject();
    });

    matSlid.addEventListener('input', function() {
        matTF.value = this.value;
        frameRenderObj.cartItem.matWidth = this.value * 10;
        renderObject();
    });

    frameWidthTF.addEventListener('input', function() {
        if (this.value.length == 0) return;
        if (isNaN(this.value)) return;
        let tfVal = parseFloat(parseInt(Math.round(this.value * 10))) / 10;
        tfVal = Math.min(5, tfVal);
        tfVal = Math.max(2, tfVal);
        frameWidthSlid.value = tfVal;
        this.value = tfVal;
        frameRenderObj.cartItem.frameWidth = tfVal * 10;
        renderObject();
    });

    matTF.addEventListener('input', function() {
        if (this.value.length == 0) return;
        if (isNaN(this.value)) return;
        let tfVal = parseFloat(parseInt(Math.round(this.value * 10))) / 10;
        tfVal = Math.min(10, tfVal);
        tfVal = Math.max(0, tfVal);
        matSlid.value = tfVal;
        this.value = tfVal;
        frameRenderObj.cartItem.matWidth = tfVal * 10;
        renderObject();
    });

    frameWidthTF.addEventListener('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.blur();
            if (this.value.length == 0) {
                this.value = frameWidthSlid.value;
            }
            frameRenderObj.frameWidth = this.value;
            renderObject();
        }
    }); 

    matTF.addEventListener('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.blur();
            if (this.value.length == 0) {
                this.value = matSlid.value;
            }
            frameRenderObj.cartItem.matWidth = this.value;
            renderObject();
        }
    });
}

export function determinePrefSet() {
        if (frameRenderObj.cartItem.printSize == 'S') {    
            document.getElementById("print-size-s").checked = true;
        } else if (frameRenderObj.cartItem.printSize == 'L') {
            document.getElementById("print-size-l").checked = true;
        } else {
            document.getElementById("print-size-m").checked = true;
        }
        if (frameRenderObj.cartItem.frameStyle == "classic") {    
            document.getElementById("frame-style-classic").checked = true;
        } else if (frameRenderObj.cartItem.frameStyle == "shabby") {
            document.getElementById("frame-style-shabby").checked = true;
        } else if (frameRenderObj.cartItem.frameStyle == "elegant") {
            document.getElementById("frame-style-elegant").checked = true;
        } else {
            document.getElementById("frame-style-natural").checked = true;
        }
        if (frameRenderObj.cartItem.matColor == "ivory") {    
            document.getElementById("mat-color-ivory").checked = true;
        } else if (frameRenderObj.cartItem.matColor == "wine") {
            document.getElementById("mat-color-wine").checked = true;
        } else if (frameRenderObj.cartItem.matColor == "indigo") {
            document.getElementById("mat-color-indigo").checked = true;
        } else if (frameRenderObj.cartItem.matColor == "coal") {
            document.getElementById("mat-color-coal").checked = true;
        } else {
            document.getElementById("mat-color-mint").checked = true;
        }
        const frameWidthTF = document.getElementById("frameWidth");
        const frameWidthSlid = document.getElementById("frameWidthR");
        const matTF = document.getElementById("matWidth");
        const matSlid = document.getElementById("matWidthR");
        frameWidthTF.value = frameRenderObj.cartItem.frameWidth / 10;
        frameWidthSlid.value = frameRenderObj.cartItem.frameWidth / 10;
        matTF.value = frameRenderObj.cartItem.matWidth / 10;
        matSlid.value = frameRenderObj.cartItem.matWidth / 10;
} 
    
export function createEventListenersForRadioButtonGroups() {
    const inputs = document.querySelectorAll("input[type=radio]");
    let x = inputs.length;
    while(x--)
        inputs[x].addEventListener('change', () => {
            // printSize
            if (document.getElementById("print-size-s").checked) {
                frameRenderObj.cartItem.printSize = "S";
            } else if (document.getElementById("print-size-m").checked) {
                frameRenderObj.cartItem.printSize = "M";
            } else if (document.getElementById("print-size-l").checked) {
                frameRenderObj.cartItem.printSize = "L";
            } else {
                frameRenderObj.cartItem.printSize = "M";
            }
            // frameStyle
            if (document.getElementById("frame-style-classic").checked) {
                frameRenderObj.cartItem.frameStyle = "classic";
            } else if (document.getElementById("frame-style-natural").checked) {
                frameRenderObj.cartItem.frameStyle = "natural";
            } else if (document.getElementById("frame-style-shabby").checked) {
                frameRenderObj.cartItem.frameStyle = "shabby";
            } else if (document.getElementById("frame-style-elegant").checked) {
                frameRenderObj.cartItem.frameStyle = "elegant";
            } else {
                frameRenderObj.cartItem.frameStyle = "natural";
            }
            // matColor
            if (document.getElementById("mat-color-ivory").checked) {
                frameRenderObj.cartItem.matColor = "ivory";
            } else if (document.getElementById("mat-color-mint").checked) {
                frameRenderObj.cartItem.matColor = "mint";
            } else if (document.getElementById("mat-color-wine").checked) {
                frameRenderObj.cartItem.matColor = "wine";
            } else if (document.getElementById("mat-color-indigo").checked) {
                frameRenderObj.cartItem.matColor = "indigo";
            } else if (document.getElementById("mat-color-coal").checked) {
                frameRenderObj.cartItem.matColor = "coal";
            } else {
                frameRenderObj.cartItem.matColor = "mint";
            }
            renderObject();
        }, 0);       
}

export function updateFROjbect(str) {
    let what = "objectID=";
    let i = str.indexOf(what);
    if (i > -1) {
        let j = str.indexOf("&", i);
        if (j == -1) {
            j = str.length;
        }
        frameRenderObj.cartItem.objectID = str.substring(i + what.length, j);
        console.log("objectID: " + frameRenderObj.cartItem.objectID);
    } else {
        window.location.href = "search.html";
    }
    what = "printSize=";
    i = str.indexOf(what);
    if (i > -1) {
        let j = str.indexOf("&", i);
        if (j == -1) {
            j = str.length;
        }
        frameRenderObj.cartItem.printSize = str.substring(i + what.length, j);
        console.log("printSize: " + frameRenderObj.cartItem.printSize);
    } else {
        frameRenderObj.cartItem.printSize = 'M';
    }
    what = "frameWidth=";
    i = str.indexOf(what);
    if (i > -1) {
        let j = str.indexOf("&", i);
        if (j == -1) {
            j = str.length;
        }
        frameRenderObj.cartItem.frameWidth = parseFloat(str.substring(i + what.length, j));
        console.log("frameWidth: " + frameRenderObj.cartItem.frameWidth);
    }else { 
        frameRenderObj.cartItem.frameWidth = 40;
    }
    what = "frameStyle=";
    i = str.indexOf(what);
    if (i > -1) {
        let j = str.indexOf("&", i);
        if (j == -1) {
            j = str.length;
        }
        frameRenderObj.cartItem.frameStyle = str.substring(i + what.length, j);
        console.log("frameStyle: " + frameRenderObj.cartItem.frameStyle);
    } else {
        frameRenderObj.cartItem.frameStyle = "natural";
    }
    what = "matWidth=";
    i = str.indexOf(what);
    if (i > -1) {
        let j = str.indexOf("&", i);
        if (j == -1) {
            j = str.length;
        }
        frameRenderObj.cartItem.matWidth = parseFloat(str.substring(i + what.length, j));
        console.log("matWidth: " + frameRenderObj.cartItem.matWidth);
    } else {
        frameRenderObj.cartItem.matWidth = 55;
    }
    what = "matColor=";
    i = str.indexOf(what);
    if (i > -1) {
        let j = str.indexOf("&", i);
        if (j == -1) {
            j = str.length;
        }
        frameRenderObj.cartItem.matColor = str.substring(i + what.length, j);
        console.log("matColor: " + frameRenderObj.cartItem.matColor);
    } else {
        frameRenderObj.cartItem.matColor = "mint";
    }
}

export function onPageLoad() {
    connectSliderTextfield();
    createEventListenersForRadioButtonGroups();
    const parts = window.location.href.split("?");
    updateFROjbect(parts[1]);
    if (parts.length > 1) {
        determineArtwork();
        determinePrefSet();
        renderObject();
    } else {
        window.location.href = "search.html";
    }
}