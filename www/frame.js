import { CartItem } from './cart-item.js';
import * as Cart from './cart.js';

// ToDo: re-render object if any of the radio buttons is changed
export var frameRenderObj = {
    img:document.getElementById("preview-image"), 
    container:document.getElementById("preview-container"), 
    printSize:'M', 
    frameStyle:"natural", 
    frameWidth:4.0, 
    matColor:"mint", 
    matWidth:5.5
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
    render(frameRenderObj.img, frameRenderObj.container, frameRenderObj.printSize, frameRenderObj.frameStyle, frameRenderObj.frameWidth, frameRenderObj.matColor, frameRenderObj.matWidth);
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
export async function determineArtwork(objectID) {
    const artWorkUrl = "https://collectionapi.metmuseum.org/public/collection/v1/objects/" + objectID;
    try {
        const response = await fetch(artWorkUrl, {method: 'GET'});
        const artworks = await response.json();
        if (artworks.primaryImageSmall.length == 0) {
            // redirect to search page
            window.location.href = "search.html";
        }
        const img = new Image();
        const x = document.getElementById("preview-image");
        
        img.onload = function() {
            x.src = img.src;
        };
        
        img.src = artworks.primaryImageSmall;
        
        // img.src = artworks.primaryImageSmall;
        loadImage();
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
        frameRenderObj.frameWidth = this.value;
        renderObject();
    }

    matSlid.oninput = function() {
        matTF.value = this.value;
        frameRenderObj.matWidth = this.value;
        renderObject();
    }

    frameWidthTF.oninput = function() {
        if (this.value.length == 0) return;
        if (isNaN(this.value)) return;
        let tfVal = parseFloat(parseInt(Math.round(this.value * 10))) / 10;
        tfVal = Math.min(5, tfVal);
        tfVal = Math.max(2, tfVal);
        frameWidthSlid.value = tfVal;
        this.value = tfVal;
        frameRenderObj.frameWidth = tfVal;
        renderObject();
    }

    matTF.oninput = function() {
        if (this.value.length == 0) return;
        if (isNaN(this.value)) return;
        let tfVal = parseFloat(parseInt(Math.round(this.value * 10))) / 10;
        tfVal = Math.min(10, tfVal);
        tfVal = Math.max(0, tfVal);
        matSlid.value = tfVal;
        this.value = tfVal;
        frameRenderObj.matWidth = tfVal;
        renderObject();
    }

    frameWidthTF.onkeypress = function(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.blur();
            if (this.value.length == 0) {
                this.value = frameWidthSlid.value;
            }
            frameRenderObj.frameWidth = this.value;
            renderObject();
        }
    } 

    matTF.onkeypress = function(e) {
        if (e.which === 13) {
            e.preventDefault();
            this.blur();
            if (this.value.length == 0) {
                this.value = matSlid.value;
            }
            frameRenderObj.matWidth = this.value;
            renderObject();
        }
    }
}

// ToDo: change this, there is a render object now
export function determinePrefSet(objectID, shouldRender) {
    const item = Cart.getItem(objectID);
    if (item != null) {
        if (item.printSize == 'S') {    
            document.getElementById("print-size-s").checked = true;
            frameRenderObject.printSize = 'S';
        } else if (item.printSize == 'M') {
            document.getElementById("print-size-m").checked = true;
            frameRenderObject.printSize = 'M';
        } else if (item.printSize == 'L') {
            document.getElementById("print-size-l").checked = true;
            frameRenderObject.printSize = 'L';
        } else {
            document.getElementById("print-size-m").checked = true;
            frameRenderObject.printSize = 'M';
        }
        if (item.frameStyle == "classic") {    
            document.getElementById("frame-style-classic").checked = true;
            frameRenderObject.frameStyle = "classic";
        } else if (item.frameStyle == "natural") {
            document.getElementById("frame-style-natural").checked = true;
            frameRenderObject.frameStyle = "natural";
        } else if (item.frameStyle == "shabby") {
            document.getElementById("frame-style-shabby").checked = true;
            frameRenderObject.frameStyle = "shabby";
        } else if (item.frameStyle == "elegant") {
            document.getElementById("frame-style-elegant").checked = true;
            frameRenderObject.frameStyle = "elegant";
        } else {
            document.getElementById("frame-style-natural").checked = true;
            frameRenderObject.frameStyle = "natural";
        }
        if (item.matColor == "ivory") {    
            document.getElementById("mat-color-ivory").checked = true;
            frameRenderObject.matColor = "ivory";
        } else if (item.matColor == "mint") {
            document.getElementById("mat-color-mint").checked = true;
            frameRenderObject.matColor = "mint";
        } else if (item.matColor == "wine") {
            document.getElementById("mat-color-wine").checked = true;
            frameRenderObject.matColor = "wine";
        } else if (item.matColor == "indigo") {
            document.getElementById("mat-color-indigo").checked = true;
            frameRenderObject.matColor = "indigo";
        } else if (item.matColor == "coal") {
            document.getElementById("mat-color-coal").checked = true;
            frameRenderObject.matColor = "coal";
        } else {
            document.getElementById("mat-color-mint").checked = true;
            frameRenderObject.matColor = "mint";
        }
        const frameWidthTF = document.getElementById("frameWidth");
        const frameWidthSlid = document.getElementById("frameWidthR");
        const matTF = document.getElementById("matWidth");
        const matSlid = document.getElementById("matWidthR");
        if (item.frameWidth != null) {
            if (item.frameWidth >= 2 && item.frameWidth <= 5) {
               frameRenderObject.frameWidth = item.frameWidth;  
            }
        }
        if (item.matWidth != null) {
            if (item.matWidth >= 0 && item.matWidth <= 10) {
                frameRenderObject.matWidth = item.matWidth;
            }
        }
        frameWidthTF.value = frameRenderObject.frameWidth;
        frameWidthSlid.value = frameRenderObject.frameWidth;
        matTF.value = frameRenderObject.matWidth;
        matSlid.value = frameRenderObject.matWidth;
    }
    // if (shouldRender) renderObject();
}
    
export function createEventListenersForRadioButtonGroups() {
    const inputs = document.querySelectorAll("input[type=radio]");
    let x = inputs.length;
    while(x--)
        inputs[x].addEventListener("change",function() {
            // printSize
            if (document.getElementById("print-size-s").checked) {
                frameRenderObj.printSize = "S";
            } else if (document.getElementById("print-size-m").checked) {
                frameRenderObj.printSize = "M";
            } else if (document.getElementById("print-size-l").checked) {
                frameRenderObj.printSize = "L";
            } else {
                frameRenderObj.printSize = "M";
            }
            // frameStyle
            if (document.getElementById("frame-style-classic").checked) {
                frameRenderObj.frameStyle = "classic";
            } else if (document.getElementById("frame-style-natural").checked) {
                frameRenderObj.frameStyle = "natural";
            } else if (document.getElementById("frame-style-shabby").checked) {
                frameRenderObj.frameStyle = "shabby";
            } else if (document.getElementById("frame-style-elegant").checked) {
                frameRenderObj.frameStyle = "elegant";
            } else {
                frameRenderObj.frameStyle = "natural";
            }
            // matColor
            if (document.getElementById("mat-color-ivory").checked) {
                frameRenderObj.matColor = "ivory";
            } else if (document.getElementById("mat-color-mint").checked) {
                frameRenderObj.matColor = "mint";
            } else if (document.getElementById("mat-color-wine").checked) {
                frameRenderObj.matColor = "wine";
            } else if (document.getElementById("mat-color-indigo").checked) {
                frameRenderObj.matColor = "indigo";
            } else if (document.getElementById("mat-color-coal").checked) {
                frameRenderObj.matColor = "coal";
            } else {
                frameRenderObj.matColor = "mint";
            }
            renderObject();
        }, 0);       
}


export function onPageLoad() {
    connectSliderTextfield();
    createEventListenersForRadioButtonGroups();
    const parts = window.location.href.split("?objectID=");
    if (parts.length > 1) {
        determineArtwork(parts[1]);
        determinePrefSet(parts[1], false);
        
    } else {
        window.location.href = "search.html";
    }
    renderObject();
}