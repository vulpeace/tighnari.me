function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
}

async function fetchSpotifyToken(id, secret) {
    const blob = new Blob([id + ':' + secret], { type: 'text/plain' });
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + await blobToBase64(blob),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: new URLSearchParams({
            grant_type: 'client_credentials'
        }),
    };

    try {
        const response = await fetch(authOptions.url, {
            method: 'POST',
            headers: authOptions.headers,
            body: authOptions.data
        });
        if (!response.ok) {
            throw new Error(`Please check your Spotify credentials, status code: ${response.status}`);
        }

        const responseData = await response.json();
        const token = responseData.access_token;
        return token;
    } catch (error) {
        throw error;
    }
}

async function fetchSpotifyResponse(token, name, artist) {
    try {
        let query = encodeURIComponent(`track:${name} artist:${artist}`);
        query = encodeURIComponent(query);

        const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&market=US&locale=en-US`, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        });

        if (response.status === 500) {
            return { "retryAfter": 5 };
        }

        if (response.status === 429) {
            return { "retryAfter": response.headers.get('retry-after') };
        }
        if (!response.ok) {
            throw new Error(`Couldn't fetch data from Spotify, status code: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}

async function fetchArtistImage(token, key, username, artist) {
    try {
        const query = encodeURIComponent(`artist:${artist}`);

        const spotifyResponse = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=artist&market=US&locale=en-US`, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        });

        if (!spotifyResponse.ok) {
            throw new Error(`Couldn't fetch data from Spotify, status code: ${spotifyResponse.status}`);
        }

        const responseData = await spotifyResponse.json();

        if (Object.keys(responseData.artists.items).length) {
            for (let i = 0; i < Object.keys(responseData.artists.items).length; i++) {
                if (responseData.artists.items[i].name === artist) {
                    return responseData.artists.items[i].images?.find(x => x.height === 640)?.url;
                }
            }
        }

        const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&format=json&extended=true&api_key=${key}&limit=1&user=${username}&period=12month`;

        let lastfmResponse = await fetch(url);
        lastfmResponse = await lastfmResponse.json();

        return lastfmResponse.topartists.artist[0].image?.find(x => x.size === "large")?.["#text"];
    } catch (error) {
        throw error;
    }
}

async function fetchDuration(token, name, artist) {
    try {
        let strippedName = name.replace(/\s*\(.*?\)/g, '').replace(/\s\b(feat|ft)\b.*/gi, '');

        let spotifyResponse = await fetchSpotifyResponse(token, strippedName, artist);
        if (spotifyResponse.retryAfter) {
            await new Promise(resolve => setTimeout(resolve, (spotifyResponse.retryAfter + 1) * 1000));
            spotifyResponse = await fetchSpotifyResponse(token, strippedName, artist);
        }

        if (Object.keys(spotifyResponse.tracks.items).length) {
            for (let i = 0; i < Object.keys(spotifyResponse.tracks.items).length; i++) {
                const spotifyName = spotifyResponse.tracks.items[i].name;
                if (spotifyResponse.tracks.items[i].artists.find(x =>
                    x.name.localeCompare(artist, undefined,
                    { sensitivity: 'accent' }) === 0)) {
                        if ((spotifyName.localeCompare(name, undefined,
                            { sensitivity: 'accent' }) === 0) || (spotifyName.localeCompare(name.replace(/\s*\((.*?)\)/, ' - $1'), undefined,
                            { sensitivity: 'accent' }) === 0) || (spotifyName.replace(/\s*\(.*?\)/g, '').replace(/\s\b(feat|ft)\b.*/gi, '').localeCompare(strippedName, undefined,
                            { sensitivity: 'accent' }) === 0)) {
                                return Math.floor(spotifyResponse.tracks.items[i].duration_ms / 1000);
                        }
                }
            }
        }

        return 0;
    } catch(error) {
        throw error;
    }
}

async function fetchLastfmResponse(username, key) {
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&format=json&extended=true&api_key=${key}&limit=1000&user=${username}&period=12month`;

        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Couldn't fetch data from Last.fm, status code: ${response.status}`);
        }

        const responseData = await response.json();
        const jsonPages = responseData.toptracks["@attr"].totalPages;
        delete responseData.toptracks["@attr"];

        if (jsonPages > 1) {
            for (let i = 2; i <= jsonPages; i++) {
                let tempResponse = await fetch(url + `&page=${i}`);
                if (!tempResponse.ok) {
                    throw new Error(`Could not fetch data from Last.fm, status code: ${response.status}`);
                }

                tempResponse = await tempResponse.json();
                delete tempResponse.toptracks["@attr"];
                responseData.toptracks.track.push(...tempResponse.toptracks.track);
            }
        }

        return responseData;
    } catch(error) {
        throw error;
    }
}

export async function fetchStats() {
    try{
        const username = document.getElementById('username').value;
        const lastfmApiKey = document.getElementById('lastfmkey').value;
        const spotifyId = document.getElementById('spotifyid').value;
        const spotifySecret = document.getElementById('spotifysecret').value;

        const currentTrack = document.createElement('p');
        document.getElementById('progressContainer').appendChild(currentTrack);

        const response = await fetchLastfmResponse(username, lastfmApiKey);
        const jsonLength = Object.keys(response.toptracks.track).length;

        let secondsListened = 0;
        let topArtists = [];
        let nonMatched = 0;

        const token = await fetchSpotifyToken(spotifyId, spotifySecret);

        for (let number = 0; number < jsonLength; number++) {
            currentTrack.textContent = `Processing track #${number} out of ${jsonLength}`;

            const track = response.toptracks.track[number];
            const artist = track.artist.name.replace(/(;|,).*/gi, '');

            if (track.duration == 0) {
                let duration = await fetchDuration(token, track.name, artist);

                track.duration = duration;
                nonMatched += duration ? 0 : 1;
            }

            const localArtist = topArtists.find(x => x.name === artist);

            if (localArtist) {
                localArtist.playSeconds += track.duration * track.playcount;
            } else {
                topArtists.push( { "name": `${artist}`, "playSeconds": track.duration * track.playcount} );
            }
            secondsListened += track.duration * track.playcount;
        }

        let topSongs = [];
        for (let i = 0; i < 5; i++) {
            const track = response.toptracks.track[i];
            topSongs.push({ "name": track.name, "playCount": track.playcount,
                "playMinutes": Math.floor(track.duration * track.playcount / 60) });
        }

        let minutesListened = Math.floor(secondsListened / 60);
        if (document.getElementById('lengthCheckbox').checked) {
            minutesListened += nonMatched * Math.floor(minutesListened / (jsonLength - nonMatched));
        }

        topArtists = topArtists.sort((a, b) => b.playSeconds - a.playSeconds).slice(0, 5);

        for (let i = 0; i < 5; i++) {
            topArtists[i].playMinutes = Math.floor(topArtists[i].playSeconds / 60);
            delete topArtists[i].playSeconds;
        }

        const artistImage = await fetchArtistImage(token, lastfmApiKey, username, topArtists[0].name);

        return { "artists": topArtists, "artistImage": artistImage, "songs": topSongs, "minutesListened": minutesListened };
    } catch(error) {
        throw error;
    }
}
