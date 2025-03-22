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

document.getElementById('startButton').addEventListener('click', validate);
document.getElementById('resetButton').addEventListener('click', resetButtonState);
document.getElementById('infoButton').addEventListener('click', openDialog);

async function generateWrapped() {
    try {
        const startButton = document.getElementById('startButton');
        startButton.setAttribute('disabled', true);
        const lengthCheckbox = document.getElementById('lengthCheckbox');
        lengthCheckbox.setAttribute('disabled', true);
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

        const imageContainer = document.createElement('div');
        imageContainer.id = 'imageContainer';
        const artistImage = document.createElement('img');
        artistImage.src = response.artistImage;
        imageContainer.appendChild(artistImage);

        const artistsElem = document.createElement('div');
        const artistsHeader = document.createElement('p');
        artistsHeader.classList.add('md-typescale-body-medium');
        artistsHeader.textContent = 'Top Artists';
        artistsElem.appendChild(artistsHeader);
        artistsElem.id = 'artists';
        artistsElem.style.marginRight = '64px';
        for (let i = 0; i < 5; i++) {
            const artist = document.createElement('span');
            artist.classList.add('md-typescale-title-medium');
            artist.textContent = `${i + 1} ${response.artists[i].name}\n`;
            artistsElem.appendChild(artist);
        }

        const songsElem = document.createElement('div');
        const songsHeader = document.createElement('p');
        songsHeader.classList.add('md-typescale-body-medium');
        songsHeader.textContent = 'Top Songs';
        songsElem.appendChild(songsHeader);
        songsElem.id = 'songs';
        for (let i = 0; i < 5; i++) {
            const song = document.createElement('span');
            song.classList.add('md-typescale-title-medium');
            song.textContent = `${i + 1} ${response.songs[i].name}\n`;
            songsElem.appendChild(song);
        }

        const statsContainer = document.createElement('div');
        statsContainer.id = 'statsContainer';
        statsContainer.appendChild(artistsElem);
        statsContainer.appendChild(songsElem);

        const minutesContainer = document.createElement('div');
        minutesContainer.id = 'minutes';
        const minutesHeader = document.createElement('p');
        minutesHeader.classList.add('md-typescale-body-medium');
        minutesHeader.textContent = 'Minutes Listened';
        minutesContainer.appendChild(minutesHeader);
        let minutes = document.createElement('span');
        minutes.textContent = response.minutesListened.toLocaleString(undefined);
        minutes.classList.add('md-typescale-headline-large');
        minutesContainer.appendChild(minutes);

        resultContainer.textContent = '';
        resultContainer.appendChild(imageContainer);
        resultContainer.appendChild(statsContainer);
        resultContainer.appendChild(minutesContainer);
        const saveButton = document.createElement('md-filled-tonal-button');
        saveButton.id = 'saveButton';
        saveButton.setAttribute('has-icon', true);
        saveButton.setAttribute('aria-label', 'Save a screenshot');
        saveButton.innerHTML = '<md-icon slot="icon" aria-hidden="true">download</md-icon>Save';
        resultContainer.appendChild(saveButton);
        saveButton.addEventListener('click', saveScreenshot);

        const jsonData = document.createElement('span');
        jsonData.setAttribute('hidden', true);
        jsonData.id = 'jsonData';
        jsonData.textContent = JSON.stringify(response);
        document.body.appendChild(jsonData);

        startButton.removeAttribute('disabled');
        lengthCheckbox.removeAttribute('disabled');
    } catch(error) {
        console.error(error);

        const errorElem = document.createElement('div');
        errorElem.id = 'errorElem';
        errorElem.textContent = error.message;
        resultContainer.textContent = '';
        resultContainer.appendChild(errorElem);

        startButton.removeAttribute('disabled');
        lengthCheckbox.removeAttribute('disabled');
    }
}

function validate() {
    const form = document.getElementById('inputForm');
    if (form.checkValidity()) {
        generateWrapped();
    }
}

function resetButtonState() {
    window.location.reload();
}

function openDialog() {
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

async function saveScreenshot() {
    const canvas = await drawCanvas(document.getElementById('jsonData').textContent);
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    const a = document.createElement('a');
    a.href = dataURL;
    const username = document.getElementById('username').value;
    a.download = `${username}_wrapped.jpg`;
    a.click();
};
