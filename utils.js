// https://github.com/stephancill/synthetic-loot-viewer

const {Canvas, Image} = require("canvas")
const deploymentMap = require("./public/map.json")

const mapping = require("./public/item_layer_mapping.json")
const layersOrder = require("./public/item_layer_order.json")

const IMG_DIR = `ipfs://${deploymentMap.ipfs.character_imgs}`

const parseName = (name) => {
    let parsedName = {
        hasPrefix: false,
        prefix: "",
        hasSuffix: false,
        suffix: "",
        plusOne: false,
        name: ""
    }
    
    let splitName;
    
    // Check for prefix
    if (name[0] === "\"") {
        parsedName.hasPrefix = true;
        splitName = name.split("\"");
        parsedName.prefix = splitName[1];
        name = splitName[2];  // NOTE - we modify the function arg `name`
    }
    
    // Check for suffix
    if (name.indexOf(" of ") >= 0) {
        parsedName.hasSuffix = true;
        splitName = name.split(" of ");
        parsedName.suffix = "of " + splitName[1];
        if (parsedName.suffix.indexOf(" +1") >= 0) {
            parsedName.plusOne = true;
            parsedName.suffix = parsedName.suffix.split(" +1")[0];
        }
        name = splitName[0];  // NOTE - we modify the function arg `name`
    }
    
    parsedName.name = name.trim();
    
    return parsedName;
}

function updateLayers(loot_name, loot, LAYERS) {
    const parsedName = parseName(loot)
    
    LAYERS[`${loot_name}Name`] = `${IMG_DIR}/${mapping[loot_name]['name'][parsedName['name']]}`
    
    // Prefix
    if (parsedName["prefix"]) {
        LAYERS[`${loot_name}Prefix`] = `${IMG_DIR}/${mapping[loot_name]['prefix']}`
    }
    
    // Suffix
    if (parsedName["suffix"]) {
        LAYERS[`${loot_name}Suffix`] = `${IMG_DIR}/${mapping[loot_name]['suffix'][parsedName['name']][parsedName['suffix']]}`
    }
    
    // +1
    if (parsedName["plus_one"]) {
        LAYERS[`${loot_name}PlusOne`] = `${IMG_DIR}/${mapping[loot_name]['plus_one']}`
    }
}

function getLayers(LOOT) {
    if (Array.isArray(LOOT)) {
        const keys = ["weapon", "chest", "head", "waist", "foot", "hand", "neck", "ring"]
        const map = {}
        keys.forEach((key, i) => {
            map[key] = LOOT[i]
        })
        LOOT = map
    }
    
    // console.log(LOOT)
    
    const LAYERS = {
        "fg": `${IMG_DIR}/fg.png`, "bg": `${IMG_DIR}/bg.png`,   // Foreground & Background are at the root
        "weaponName": null, "weaponPrefix": null, "weaponSuffix": null, "weaponPlusOne": null,
        "chestName": null, "chestPrefix": null, "chestSuffix": null, "chestPlusOne": null,
        "headName": null, "headPrefix": null, "headSuffix": null, "headPlusOne": null,
        "waistName": null, "waistPrefix": null, "waistSuffix": null, "waistPlusOne": null,
        "footName": null, "footPrefix": null, "footSuffix": null, "footPlusOne": null,
        "handName": null, "handPrefix": null, "handSuffix": null, "handPlusOne": null,
        "neckName": null, "neckPrefix": null, "neckSuffix": null, "neckPlusOne": null,
        "ringName": null, "ringPrefix": null, "ringSuffix": null, "ringPlusOne": null,
    }
    
    Object.keys(LOOT).forEach(key => updateLayers(key, LOOT[key], LAYERS))
    
    return LAYERS
}

async function getImageForLoot(loot) {
    let LAYERS = getLayers(loot)
    let files = []
    layersOrder.forEach(layerName => {
        if (LAYERS[layerName]) {
            files.push(LAYERS[layerName])
        }
    })
    
    files = files.map(file => {
        if (file.indexOf("ipfs://") > -1) {
            // file = `https://ipfs.io/ipfs/${file.split("ipfs://")[1]}`
            file = `./public/${file.split("ipfs://")[1]}`
        }
        // console.log(file)
        return file
    })
    
    return await mergeImages(files, {crossOrigin: "anonymous", Canvas: Canvas, Image: Image});
}

//https://github.com/bpierre/loot-rarity/blob/main/src/image.ts#L24
function itemsFromSvg(svg) {
    if (!svg.startsWith("<svg")) {
        throw new Error("The svg paramater doesn’t seem to be an SVG");
    }
    
    let matches;
    const items = [];
    for (let i = 0; i < 8; i++) {
        // eslint-disable-next-line
        const matcher = /<text[^>]+\>([^<]+)<\/text>/
        matches = svg.match(matcher);
        if (!matches) {
            if (items.length === 0) {
                throw new Error(
                    "Error when parsing the SVG: couldn’t find the next item"
                );
            }
            // Probably a LootLoose image
            return items;
        }
        items.push(matches[1]);
        svg = svg.slice(svg.indexOf(matches[0]) + matches[0].length);
    }
    return items;
}

// https://github.com/lukechilds/merge-images
// Defaults
const defaultOptions = {
    format: 'image/png',
    quality: 0.92,
    width: undefined,
    height: undefined,
    Canvas: undefined,
    crossOrigin: undefined
};

// Return Promise
const mergeImages = (sources = [], options = {}) => new Promise(resolve => {
    options = Object.assign({}, defaultOptions, options);
    
    // Setup browser/Node.js specific variables
    const canvas = new options.Canvas();
    // console.log("canvas:", canvas)
    const Image = options.Image;
    // console.log("Image:", Image)
    
    // Load sources
    const images = sources.map(source => new Promise((resolve, reject) => {
        // Convert sources to objects
        if (source.constructor.name !== 'Object') {
            source = {src: source};
        }
        
        // Resolve source and img when loaded
        const img = new Image();
        img.crossOrigin = options.crossOrigin;
        // img.onerror = () => reject(new Error('Couldn\'t load image'));
        img.onload = () => resolve(Object.assign({}, source, {img}));
        img.src = source.src;
    }));
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    // console.log("ctx:", ctx)
    
    // When sources have loaded
    resolve(Promise.all(images)
        .then(images => {
            // Set canvas dimensions
            const getSize = dim => options[dim] || Math.max(...images.map(image => image.img[dim]));
            canvas.width = getSize('width');
            canvas.height = getSize('height');
            // canvas.width = 1000;
            // canvas.height = 1000;
            
            // Draw images to canvas
            images.forEach(image => {
                ctx.globalAlpha = image.opacity ? image.opacity : 1;
                return ctx.drawImage(image.img, image.x || 0, image.y || 0);
            });
            
            // if (options.Canvas && options.format === 'image/jpeg') {
            //     // Resolve data URI for node-canvas jpeg async
            //     return new Promise((resolve, reject) => {
            //         canvas.toDataURL(options.format, {
            //             quality: options.quality,
            //             progressive: false
            //         }, (err, jpeg) => {
            //             if (err) {
            //                 console.error(err);
            //                 reject(err);
            //                 return;
            //             }
            //             resolve(jpeg);
            //         });
            //     });
            // }
            
            // Resolve all other data URIs sync
            return canvas.toDataURL(options.format, options.quality);
        }));
});

module.exports = {getImageForLoot, itemsFromSvg}

