// Global selections and varirables

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const slidersDivs = document.querySelectorAll(".sliders");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const adjustBtn = document.querySelectorAll(".adjust");
const closeAdjustBtn = document.querySelectorAll(".close-adjustment");
const lockBtn = document.querySelectorAll(".lock");
let initialColors;

// Functions

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

        // Add it to the array
        initialColors.push(randomColor.hex());

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

// Event listeners

// First generated colors
document.addEventListener("load", randomColors());

// Space key to generate colors
document.addEventListener("keypress", function (e) {
    e.preventDefault();
    if (e.keyCode == 32) randomColors();
});

// Button to generate colors
generateBtn.addEventListener("click", randomColors);

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
