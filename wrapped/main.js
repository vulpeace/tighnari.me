import '@material/web/icon/icon.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/iconButton/filled-tonal-icon-button.js';
import '@material/web/iconButton/icon-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/progress/circular-progress.js'
import {styles as typescaleStyles} from '@material/web/typography/md-typescale-styles.js';
import { fetchStats } from './fetch-stats.js';
import { drawCanvas } from './draw-canvas.js';

document.adoptedStyleSheets.push(typescaleStyles.styleSheet);
document.getElementById('exampleImage').style.height = `${document.getElementById('infoContainer').offsetHeight * 0.7}px`;

document.getElementById('startButton').addEventListener('click', validate);
document.getElementById('resetButton').addEventListener('click', openResetDialog);
document.getElementById('infoButton').addEventListener('click', openHelpDialog);

async function generateWrapped() {
    try {
        const startButton = document.getElementById('startButton');
        startButton.setAttribute('disabled', true);
        for (let i = 0; i < 5; i++) {
            document.getElementById('inputForm').children[i].children[0].setAttribute('disabled', true);
        }
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.style.display = 'flex';
        resultContainer.textContent = '';

        const progressIndicator = document.createElement('md-circular-progress');
        progressIndicator.setAttribute('indeterminate', true);
        progressIndicator.style.marginBottom = '16px';
        resultContainer.appendChild(progressIndicator);
        const progressContainer = document.createElement('div');
        progressContainer.id = 'progressContainer';
        const progressText = document.createElement('p');
        progressText.textContent = 'Please stand by\nThis might take up to 10 minutes';
        progressContainer.appendChild(progressText);
        resultContainer.appendChild(progressContainer);
        resultContainer.scrollIntoView();

        const response = await fetchStats();

        const canvasContainer = document.createElement('div');
        canvasContainer.id = 'canvasContainer';
        const canvas = await drawCanvas(response);
        resultContainer.textContent = '';
        const statsImage = document.createElement('img');
        statsImage.id = 'result';
        statsImage.src = canvas.toDataURL('image/jpeg', 0.9);
        statsImage.style.height = `${document.getElementById('infoContainer').offsetHeight * 0.7}px`;
        canvasContainer.appendChild(statsImage);

        const saveButton = document.createElement('md-filled-button');
        saveButton.id = 'saveButton';
        saveButton.setAttribute('has-icon', true);
        saveButton.setAttribute('aria-label', 'Save a screenshot');
        saveButton.innerHTML = '<md-icon slot="icon" aria-hidden="true">download</md-icon>Save';
        canvasContainer.appendChild(saveButton);
        resultContainer.appendChild(canvasContainer);
        saveButton.addEventListener('click', saveScreenshot);

        startButton.removeAttribute('disabled');
        for (let i = 0; i < 5; i++) {
            document.getElementById('inputForm').children[i].children[0].removeAttribute('disabled');
        }
    } catch(error) {
        console.error(error);

        const errorElem = document.createElement('div');
        errorElem.id = 'errorElem';
        errorElem.textContent = error.message;
        resultContainer.textContent = '';
        resultContainer.appendChild(errorElem);

        startButton.removeAttribute('disabled');
        for (let i = 0; i < 5; i++) {
            document.getElementById('inputForm').children[i].children[0].removeAttribute('disabled');
        }
    }
}

function validate() {
    const form = document.getElementById('inputForm');
    if (form.checkValidity()) {
        generateWrapped();
    }
}

function openResetDialog() {
    const dialog = document.getElementById('resetDialog');
    dialog.shadowRoot.querySelector(".scroller").style.overflow = 'hidden';
    dialog.setAttribute('open', true);
    dialog.shadowRoot.querySelector(".scroller").style.overflow = '';
    document.getElementById('confirmResetButton').addEventListener('click', async () => {
        window.location.reload();
    });
    document.getElementById('cancelResetButton').addEventListener('click', async () => {
        await dialog.close();
    });
}

function openHelpDialog() {
    const dialog = document.getElementById('infoDialog');
    dialog.shadowRoot.querySelector(".scroller").style.overflow = 'hidden';
    dialog.setAttribute('open', true);
    dialog.shadowRoot.querySelector(".scroller").style.overflow = '';
    document.getElementById('closeButton').addEventListener('click', async () => {
        await dialog.close();
    });
}

function changeScrollerOverflow(mdDialog, overflowValue) {
    const shadowRoot = mdDialog.shadowRoot;
    const scroller = shadowRoot.querySelector(".scroller");
    scroller.style.overflow = overflowValue;
}

function saveScreenshot() {
    const a = document.createElement('a');
    a.href = document.getElementById('result').src;
    const username = document.getElementById('username').value;
    a.download = `${username}_wrapped.jpg`;
    a.click();
};
