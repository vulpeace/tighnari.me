document.addEventListener("DOMContentLoaded", async () => {
    await fetchRecentTrack();
    document.body.classList.add("loaded");
});

async function fetchRecentTrack() {
    try {
        const nowPlayingElem = document.getElementById('nowplaying');
        const response = await fetch('https://tighnari.me/api/recent-track');
        const data = await response.json();

        const trackElem = document.getElementById('trackElem');
        const artistElem = document.getElementById('artistElem');
        const dateElem = document.getElementById('dateElem');
        const artworkElem = document.getElementById('artworkContainer');

        trackElem.innerHTML = "";
        artistElem.innerHTML = "by ";
        dateElem.innerHTML = "";

        const trackLinkElem = document.createElement('a');
        trackLinkElem.id = "track";
        trackLinkElem.href = data.trackLink;
        trackLinkElem.target = "_blank";
        trackLinkElem.textContent = data.track;
        trackElem.appendChild(trackLinkElem);

        const artistLinkElem = document.createElement('a');
        artistLinkElem.id = "artist";
        artistLinkElem.href = data.artistLink;
        artistLinkElem.target = "_blank";
        artistLinkElem.textContent = data.artist;
        artistElem.appendChild(artistLinkElem);

        const statusElem = document.createElement('span');
        statusElem.id = "status";

        if (data.date) {
            const unixTimestamp = data.date;
            const localDate = new Date(unixTimestamp * 1000);
            const formattedDate = localDate.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });

            statusElem.textContent = "on " + formattedDate;
        } else {
            statusElem.textContent = "Now playing 🎧";
        }
        dateElem.appendChild(statusElem);

        const albumCoverElem = document.createElement('img');
        albumCoverElem.id = "artwork";
        albumCoverElem.src = data.albumCover;
        artworkElem.appendChild(albumCoverElem);

        nowPlayingElem.classList.add('loaded');
    } catch (error) {
        console.error("Error fetching recent track:", error);
    }
}

async function refetch() {
    try {
        const nowPlayingElem = document.getElementById('nowplaying');
        const response = await fetch('https://tighnari.me/api/recent-track');
        const data = await response.json();

        const trackElem = document.getElementById('track');
        
        if (trackElem.textContent != data.track) {
            const artistElem = document.getElementById('artist');
            const statusElem = document.getElementById('status');
            const artworkElem = document.getElementById('artwork');

            trackElem.href = data.trackLink;
            trackElem.textContent = data.track;

            artistElem.href = data.artistLink;
            artistElem.textContent = data.artist;
            
            if (data.date) {
                const unixTimestamp = data.date;
                const localDate = new Date(unixTimestamp * 1000);
                const formattedDate = localDate.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });

                statusElem.textContent = "on " + formattedDate;
            } else {
                statusElem.textContent = "Now playing 🎧";
            }

            artwork.src = data.albumCover;
        }
    } catch (error) {
        console.error("Error fetching recent track:", error);
    }
}

setInterval(refetch, 10000);
