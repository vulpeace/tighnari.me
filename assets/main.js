document.addEventListener("DOMContentLoaded", async () => {
    await fetchRecentTrack();
    document.body.classList.add("loaded");
});

async function fetchRecentTrack() {
    try {
        const response = await fetch('https://tighnari.me/api/recent-track');
        const data = await response.json();

        const nowplaying = document.getElementById('nowplaying');

        const artworkContainer = document.createElement('div');
        artworkContainer.id = "artworkContainer"
        const artworkElem = document.createElement('img');
        artworkElem.id = "artwork";
        artworkElem.src = data.albumCover;
        artworkElem.alt = "Album artwork";
        artworkContainer.appendChild(artworkElem);
        nowplaying.appendChild(artworkContainer);

        nowplaying.appendChild(createInfoContainer(data));
        nowplaying.appendChild(createServices(data));

        setInterval(refetch, 10000);
    } catch (error) {
        console.error("Error fetching recent track:", error);
        nowplaying.childNodes = [];
        nowplaying.textContent = "Couldn't fetch my scrobbling status (╥_╥)";
    }
}

function formatDate(unixTimestamp) {
    const localDate = new Date(unixTimestamp * 1000);
    const formattedDate = localDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    return formattedDate;
}

function createInfoContainer(data) {
    const infoContainer = document.createElement('div');
    infoContainer.id = "info";

    const trackLinkElem = document.createElement('a');
    trackLinkElem.id = "track";
    trackLinkElem.href = data.trackLink;
    trackLinkElem.target = "_blank";
    trackLinkElem.textContent = data.track;
    infoContainer.appendChild(trackLinkElem);

    const artistElem = document.createElement('div');
    artistElem.id = "artistContainer";
    artistElem.innerHTML = "by ";
    const artistLinkElem = document.createElement('a');
    artistLinkElem.id = "artist";
    artistLinkElem.href = data.artistLink;
    artistLinkElem.target = "_blank";
    artistLinkElem.textContent = data.artist;
    artistElem.appendChild(artistLinkElem);
    infoContainer.appendChild(artistElem);

    const statusElem = document.createElement('span');
    statusElem.id = "status";

    if (data.date) {
        statusElem.textContent = "on " + formatDate(data.date);
    } else {
        statusElem.textContent = "Now playing 🎧";
    }
    infoContainer.appendChild(statusElem);

    return infoContainer;
}

function createServices(data) {
    const services = document.createElement('div');
    services.id = "services";

    const youtubeLink = document.createElement('a');
    youtubeLink.id = "youtube";
    youtubeLink.title = "Youtube search";
    youtubeLink.href = `https://www.youtube.com/results?search_query=${data.artist.replaceAll(' ', '+')}+${data.track.replaceAll(' ', '+')}`;
    youtubeLink.target = "_blank";
    youtubeLink.classList.add('icon');
    
    const youtubeIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    youtubeIcon.classList.add('iconSvg');
    youtubeIcon.innerHTML = `<use xlink:href="#youtubeIcon"></use>`;
    youtubeLink.appendChild(youtubeIcon);
    services.appendChild(youtubeLink);

    const spotifyLink = document.createElement('a');
    spotifyLink.id = "spotify";
    spotifyLink.title = "Open in Spotify";
    spotifyLink.href = data.spotifyLink ? data.spotifyLink : `https://open.spotify.com/search/${encodeURIComponent(`${data.artist}`)}`;
    spotifyLink.target = "_blank";
    spotifyLink.classList.add('icon');

    const spotifyIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    spotifyIcon.classList.add('iconSvg');
    spotifyIcon.innerHTML = `<use xlink:href="#spotifyIcon"></use>`;
    spotifyLink.appendChild(spotifyIcon);
    services.appendChild(spotifyLink);

    return services;
}

async function refetch() {
    try {
        const response = await fetch('https://tighnari.me/api/recent-track');
        const data = await response.json();

        const trackElem = document.getElementById('track');

        if (trackElem.textContent != data.track) {
            const artistElem = document.getElementById('artist');
            const statusElem = document.getElementById('status');
            const artworkElem = document.getElementById('artwork');
            const youtubeLink = document.getElementById('youtube');
            const spotifyLink = document.getElementById('spotify');

            trackElem.href = data.trackLink;
            trackElem.textContent = data.track;

            artistElem.href = data.artistLink;
            artistElem.textContent = data.artist;

            if (data.date) {
                statusElem.textContent = "on " + formatDate(data.date);
            } else {
                statusElem.textContent = "Now playing 🎧";
            }

            artwork.src = data.albumCover;
            youtubeLink.href = `https://www.youtube.com/results?search_query=${data.artist.replaceAll(' ', '+')}+${data.track.replaceAll(' ', '+')}`;
            spotifyLink.href = data.spotifyLink ? data.spotifyLink : `https://open.spotify.com/search/${encodeURIComponent(`${data.artist}`)}`;
        }
    } catch (error) {
        console.error("Error fetching recent track:", error);
        nowplaying.childNodes = [];
        nowplaying.textContent = "Couldn't fetch my scrobbling status (╥_╥)";
    }
}
