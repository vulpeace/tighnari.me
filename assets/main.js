document.addEventListener("DOMContentLoaded", async () => {
    await fetchRecentTrack();
    document.body.classList.add("loaded");
});

async function fetchRecentTrack() {
    try {
        const response = await fetch('https://tighnari.me/api/recent-track');
        const data = await response.json();

        const nowplaying = document.getElementById('nowplaying');
        const infoContainer = document.createElement('div');
        infoContainer.id = "info";

        const albumCoverElem = document.createElement('img');
        albumCoverElem.id = "artwork";
        albumCoverElem.src = data.albumCover;
        nowplaying.appendChild(albumCoverElem);


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
            const unixTimestamp = data.date;
            const localDate = new Date(unixTimestamp * 1000);
            const formattedDate = localDate.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });

            statusElem.textContent = "on " + formattedDate;
        } else {
            statusElem.textContent = "Now playing 🎧";
        }
        infoContainer.appendChild(statusElem);

        nowplaying.appendChild(infoContainer);
    } catch (error) {
        console.error("Error fetching recent track:", error);
    }
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

            trackElem.href = data.trackLink;
            trackElem.textContent = data.track;

            artistElem.href = data.artistLink;
            artistElem.textContent = data.artist;

            if (data.date) {
                const unixTimestamp = data.date;
                const localDate = new Date(unixTimestamp * 1000);
                const formattedDate = localDate.toLocaleString('en-US', {
                    month: 'short',
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
