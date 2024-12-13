document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");
});

async function fetchRecentTrack() {
    try {
        const nowPlayingElem = document.getElementById('nowplaying');
        const response = await fetch('/api/recent-track');
        const data = await response.json();

        const trackElem = document.getElementById('trackElem');
        const artistElem = document.getElementById('artistElem');
        const dateElem = document.getElementById('dateElem');
        const albumCoverElem = document.getElementById('album-cover');

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

        albumCoverElem.src = data.albumCover;

        nowPlayingElem.classList.add('loaded');
    } catch (error) {
        console.error("Error fetching recent track:", error);
    }
}

async function refetch() {
    try {
        const nowPlayingElem = document.getElementById('nowplaying');
        const response = await fetch('/api/recent-track');
        const data = await response.json();

        const trackElem = document.getElementById('trackElem');
        
        if (trackElem.textContent != data.track) {
            const artistElem = document.getElementById('artistElem');
            const dateElem = document.getElementById('dateElem');
            const albumCoverElem = document.getElementById('album-cover');
            
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

                dateElem.textContent = "on " + formattedDate;
            } else {
                dateElem.textContent = "Now playing 🎧";
            }

            albumCoverElem.src = data.albumCover;
        }
    } catch (error) {
        console.error("Error fetching recent track:", error);
    }
}

fetchRecentTrack();

setInterval(refetch, 10000);
