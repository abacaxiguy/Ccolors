// Global selections and varirables

const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
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
    colorDivs.forEach((div, i) => {
        const hexText = div.children[0];
        const randomColor = generateHex();

        // Add the color to the bg
        div.style.backgroundColor = randomColor;
        hexText.textContent = randomColor;
    });
}

// Event listeners

document.addEventListener("load", randomColors());
generateBtn.addEventListener("click", randomColors);
