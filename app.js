// ****** Global selections and varirables ******

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const slidersDivs = document.querySelectorAll(".sliders");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const adjustBtn = document.querySelectorAll(".adjust");
const closeAdjustBtn = document.querySelectorAll(".close-adjustment");
const lockBtn = document.querySelectorAll(".lock");
const popup = document.querySelector(".copy-container");
let initialColors;

// ************** Functions ****************

// Color Generator
function generateHex() {
    const hash = chroma.random();

    //               Without the chroma.js library
    // -----------------------------------------------------
    // const letters = "0123456789ABCDEF";
    // let hash = "#";
    // for (let i = 0; i < 6; i++) {
    //     hash += letters[Math.floor(Math.random() * 16)];
    // }
    // -----------------------------------------------------
    //               --------------------

    return hash;
}

// Put the color on the bg
function randomColors() {
    //
    initialColors = [];
    colorDivs.forEach((div, i) => {
        const hexText = div.children[0];
        const randomColor = generateHex();

        // Check if it's locked
        if (div.classList.contains("locked")) {
            // Add it to the array
            initialColors.push(hexText.innerText);
            return;
        } else {
            // Add it to the array
            initialColors.push(randomColor.hex());
        }

        // Add the color to the bg
        div.style.backgroundColor = randomColor;
        hexText.textContent = randomColor;

        // Check for contrast
        checkTextContrast(randomColor, [hexText, adjustBtn[i], lockBtn[i]]);

        // Initial Colorize Sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    });

    // Reset inputs
    resetInputs();
}

// Change the color of HEX text
function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    for (i of text) {
        if (luminance > 0.5) {
            i.style.color = "rgb(35, 35, 35)";
        } else {
            i.style.color = "white";
        }
    }
}

// Put the colors in the sliders
function colorizeSliders(color, hue, brightness, saturation) {
    // Scale Saturation
    const noSat = color.set("hsl.s", 0);
    const fullSat = color.set("hsl.s", 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    // Scale Brightness
    const midBright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);

    // Update input colors

    // Saturation

    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
        0
    )}, ${scaleSat(1)})`;

    // Brightness

    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
        0
    )}, ${scaleBright(0.5)},${scaleBright(1)})`;

    // Hue

    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}

// Sliders functionality
function hslControls(e) {
    const index =
        e.target.getAttribute("data-bright") ||
        e.target.getAttribute("data-sat") ||
        e.target.getAttribute("data-hue");

    let sliders = e.target.parentElement.querySelectorAll(
        'input[type="range"]'
    );
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor)
        .set("hsl.s", saturation.value)
        .set("hsl.l", brightness.value)
        .set("hsl.h", hue.value);

    colorDivs[index].style.backgroundColor = color;

    // Colorize inputs/sliders
    colorizeSliders(color, hue, brightness, saturation);
}

// Update the text to the new color
function updateTextUI(index) {
    const activediv = colorDivs[index];
    const color = chroma(activediv.style.backgroundColor);
    const textHex = activediv.querySelector("h2");
    const icons = activediv.querySelectorAll(".controls button");
    textHex.innerText = color.hex();

    // Checking the contrast
    checkTextContrast(color, [textHex, icons[0], icons[1]]);
}

// Reset the inputs to the current color
function resetInputs() {
    sliders.forEach((slider) => {
        if (slider.name == "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];

            slider.value = Math.floor(hueValue);
        }
        if (slider.name == "saturation") {
            const satColor = initialColors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1];

            slider.value = Math.floor(satValue * 100) / 100;
        }
        if (slider.name == "brightness") {
            const brightColor =
                initialColors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];

            slider.value = Math.floor(brightValue * 100) / 100;
        }
    });
}

// Create a textarea to copy the HEX of the color
function copyToClipboard(hex) {
    const el = document.createElement("textarea");
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);

    // Pop up animation
    const popupBox = popup.children[0];
    popup.classList.add("active");
    popupBox.classList.add("active");
}

// *************** Event listeners ******************

// First generated colors and library palettes
document.addEventListener("load", randomColors());

// Space key to generate colors
document.addEventListener("keypress", function (e) {
    if (e.keyCode === 32 && !saveContainer.classList.contains("active")) {
        e.preventDefault();
        randomColors();
    }
});

// Button to generate colors
generateBtn.addEventListener("click", (e) => {
    randomColors();
    e.target.blur();
});

// Close adjust color
closeAdjustBtn.forEach((btn) =>
    btn.addEventListener("click", (e) =>
        e.target.parentElement.classList.remove("active")
    )
);

// Open adjust color
adjustBtn.forEach((btn, i) =>
    btn.addEventListener("click", (e) => slidersDivs[i].classList.add("active"))
);

// Sliders function
sliders.forEach((slider) => {
    slider.addEventListener("input", hslControls);
});

// Update text color
colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
        updateTextUI(index);
    });
});

// Copy the text of HEX to clipboard
currentHexes.forEach((hex) => {
    hex.addEventListener("click", () => {
        copyToClipboard(hex);
    });
});

// Close the popup
popup.addEventListener("transitionend", () => {
    const popupBox = popup.children[0];
    popup.classList.remove("active");
    popupBox.classList.remove("active");
});

// Locks the color
lockBtn.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
        e.target.blur();
        const i = btn.children[0].classList;
        colorDivs[index].classList.toggle("locked");
        if (i.contains("fa-lock-open")) {
            i.remove("fa-lock-open");
            i.add("fa-lock");
        } else {
            i.remove("fa-lock");
            i.add("fa-lock-open");
        }
    });
});

// Save to palette & local storage stuff
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const savePopup = saveContainer.children[0];
let savedPalettes = [];

// Library stuff
const libBtn = document.querySelector(".library");
const libContainer = document.querySelector(".library-container");
const libPopup = libContainer.children[0];

// *************** Event listeners ******************

// Open save palette popup
saveBtn.addEventListener("click", openPalette);

// Close save palette popup
closeSave.addEventListener("click", closePalette);

// Close save palette popup by clicking outside
saveContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("save-container")) closePalette();
});

// Enter to save the library
saveInput.addEventListener("keypress", function (e) {
    if (e.keyCode === 13 && saveInput.value) {
        closePalette();
        savePalette();
    }
});

// Save the current palette to the library
submitSave.addEventListener("click", savePalette);

// Open library popup
libBtn.addEventListener("click", toggleLibrary);

// Close library popup by clicking outside
libContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("library-container")) toggleLibrary();
});

// ************** Functions ****************

// Open save palette popup
function openPalette() {
    saveInput.value = "";
    saveInput.focus();
    saveContainer.classList.add("active");
    savePopup.classList.add("active");
}

// Close save palette popup
function closePalette() {
    console.log("sup");
    saveContainer.classList.remove("active");
    savePopup.classList.remove("active");
}

// Save the current palette to the library
function savePalette() {
    saveContainer.classList.remove("active");
    savePopup.classList.remove("active");
    const name = saveInput.value;

    // Validation
    if (!name) return;

    const colors = [];
    currentHexes.forEach((hex) => colors.push(hex.innerText));

    // Generate object
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    let paletteNr;

    // if it has colors in Local storage, get them
    if (paletteObjects) paletteNr = paletteObjects.length;
    else paletteNr = savedPalettes.length;

    const paletteObj = { name, colors, nr: paletteNr };
    savedPalettes.push(paletteObj);

    // Save to local storage
    saveToLocal(paletteObj);
    saveInput.value = "";

    // Generate the palette for library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const title = document.createElement("h4");
    title.innerText = paletteObj.name;
    const preview = document.createElement("div");
    preview.classList.add("small-preview");

    paletteObj.colors.forEach((smallColor) => {
        const div = document.createElement("div");
        div.style.backgroundColor = smallColor;
        preview.appendChild(div);
    });

    const paletteBtn = document.createElement("button");
    paletteBtn.classList.add("pick-palette-btn");
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.innerText = "Select";

    // Atach event to the button 'Select'
    paletteBtn.addEventListener("click", (e) => {
        toggleLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, i) => {
            initialColors.push(color);
            colorDivs[i].style.backgroundColor = color;
            const text = colorDivs[i].children[0];
            checkTextContrast(color, [text]);
            updateTextUI(i);
        });
        resetInputs();
    });

    // Append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);

    // Remove the default message
    if (libPopup.children[1].tagName == "P") libPopup.children[1].remove();

    libPopup.appendChild(palette);
}

// Save the palette to the local storage
function saveToLocal(paletteObj) {
    let localPalettes;
    if (localStorage.getItem("palettes") === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem("palettes"));
    }

    localPalettes.push(paletteObj);
    localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function getLocal() {
    let localPalettes;
    if (localStorage.getItem("palettes") === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem("palettes"));

        savedPalettes = [...localPalettes];

        localPalettes.forEach((paletteObj) => {
            // Generate the palette for library
            const palette = document.createElement("div");
            palette.classList.add("custom-palette");
            const title = document.createElement("h4");
            title.innerText = paletteObj.name;
            const preview = document.createElement("div");
            preview.classList.add("small-preview");

            paletteObj.colors.forEach((smallColor) => {
                const div = document.createElement("div");
                div.style.backgroundColor = smallColor;
                preview.appendChild(div);
            });

            const paletteBtn = document.createElement("button");
            paletteBtn.classList.add("pick-palette-btn");
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerText = "Select";

            // Atach event to the button 'Select'
            paletteBtn.addEventListener("click", (e) => {
                toggleLibrary();
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                localPalettes[paletteIndex].colors.forEach((color, i) => {
                    initialColors.push(color);
                    colorDivs[i].style.backgroundColor = color;
                    const text = colorDivs[i].children[0];
                    checkTextContrast(color, [text]);
                    updateTextUI(i);
                });
                resetInputs();
            });

            // Append to library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);

            // Remove the default message
            if (libPopup.children[1].tagName == "P")
                libPopup.children[1].remove();

            libPopup.appendChild(palette);
        });
    }
}

// Open or closes the library popup
function toggleLibrary(e) {
    if (libContainer.classList.contains("active")) {
        libContainer.classList.remove("active");
        libPopup.classList.remove("active");
    } else {
        libContainer.classList.add("active");
        libPopup.classList.add("active");
    }
}

getLocal();
