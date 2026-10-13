
const starterSongs = [
  // OPM
  ["opm1", "Buwan", "Juan Karlos", "OPM", "🌙"],
  ["opm2", "Mundo", "IV of Spades", "OPM", "🌎"],
  ["opm3", "Pasilyo", "SunKissed Lola", "OPM", "💍"],
  ["opm4", "Araw-Araw", "Ben&Ben", "OPM", "☀️"],
  ["opm5", "Leaves", "Ben&Ben", "OPM", "🍃"],
  ["opm6", "Kathang Isip", "Ben&Ben", "OPM", "💭"],
  ["opm7", "Tadhana", "Up Dharma Down", "OPM", "✨"],
  ["opm8", "Migraine", "Moonstar88", "OPM", "🌧️"],
  ["opm9", "214", "Rivermaya", "OPM", "🎸"],
  ["opm10", "With a Smile", "Eraserheads", "OPM", "😊"],
  ["opm11", "The Day You Said Goodnight", "Hale", "OPM", "🌌"],
  ["opm12", "Jeepney", "Sponge Cola", "OPM", "🚌"],

  // English pop
  ["pop1", "Perfect", "Ed Sheeran", "Love Songs", "💍"],
  ["pop2", "Photograph", "Ed Sheeran", "Pop", "📸"],
  ["pop3", "Love Story", "Taylor Swift", "Pop", "📖"],
  ["pop4", "Cruel Summer", "Taylor Swift", "Pop", "☀️"],
  ["pop5", "Someone Like You", "Adele", "Love Songs", "💔"],
  ["pop6", "Rolling in the Deep", "Adele", "Pop", "🔥"],
  ["pop7", "All of Me", "John Legend", "Love Songs", "❤️"],
  ["pop8", "A Thousand Years", "Christina Perri", "Love Songs", "⌛"],
  ["pop9", "Just the Way You Are", "Bruno Mars", "Pop", "🌹"],
  ["pop10", "Talking to the Moon", "Bruno Mars", "Pop", "🌙"],
  ["pop11", "Let It Go", "Idina Menzel", "Pop", "❄️"],
  ["pop12", "Shallow", "Lady Gaga & Bradley Cooper", "Pop", "🎬"],

  // K-pop
  ["kp1", "Dynamite", "BTS", "K-pop", "💜"],
  ["kp2", "Butter", "BTS", "K-pop", "🧈"],
  ["kp3", "How You Like That", "BLACKPINK", "K-pop", "🖤"],
  ["kp4", "DDU-DU DDU-DU", "BLACKPINK", "K-pop", "✨"],
  ["kp5", "Love Scenario", "iKON", "K-pop", "💗"],
  ["kp6", "Ditto", "NewJeans", "K-pop", "🐇"],
  ["kp7", "Super Shy", "NewJeans", "K-pop", "🎀"],
  ["kp8", "Love Dive", "IVE", "K-pop", "💎"],

  // R&B
  ["rb1", "Best Part", "Daniel Caesar ft. H.E.R.", "R&B", "🎧"],
  ["rb2", "Location", "Khalid", "R&B", "📍"],
  ["rb3", "Ordinary People", "John Legend", "R&B", "💫"],
  ["rb4", "If I Ain't Got You", "Alicia Keys", "R&B", "🎹"],

  // Rock and other favorites
  ["rock1", "Numb", "Linkin Park", "Rock", "⚡"],
  ["rock2", "Yellow", "Coldplay", "Rock", "⭐"],
  ["rock3", "Zombie", "The Cranberries", "Rock", "🖤"],
  ["other1", "A Whole New World", "Aladdin Soundtrack", "Other", "🕌"],
  ["other2", "Can't Help Falling in Love", "Elvis Presley", "Love Songs", "💞"],
  ["other3", "My Heart Will Go On", "Celine Dion", "Love Songs", "🚢"]
];

const colors = [
  "linear-gradient(135deg,#ffc2df,#e7cfff)",
  "linear-gradient(135deg,#ffb9c9,#ffd8e8)",
  "linear-gradient(135deg,#d6c5ff,#ffcde8)",
  "linear-gradient(135deg,#ffd7b0,#ffb8cf)",
  "linear-gradient(135deg,#c5e8ff,#e2d5ff)",
  "linear-gradient(135deg,#ffc7eb,#d5c6ff)"
];

let songs = starterSongs.map((item, index) => ({
  id: item[0],
  title: item[1],
  artist: item[2],
  genre: item[3],
  emoji: item[4],
  color: colors[index % colors.length],
  source: "catalog",
  youtubeId: "",
  audioUrl: "",
  fileName: ""
}));

let currentSong = null;
let queue = [];
let view = "all";
let selectedGenre = "all";
let toastTimer;

const $ = (id) => document.getElementById(id);
const audio = $("audioPlayer");
const youtube = $("youtubePlayer");

function loadSavedIds(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

let favorites = new Set(loadSavedIds("pinkmic-favorites"));

function saveFavorites() {
  try {
    localStorage.setItem("pinkmic-favorites", JSON.stringify([...favorites]));
  } catch {
    showToast("Your browser could not save favorites.");
  }
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function getSong(id) {
  return songs.find(song => song.id === id);
}

function getYouTubeId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v") || "";
      } else {
        const parts = url.pathname.split("/").filter(Boolean);
        if (["embed", "shorts", "live"].includes(parts[0])) {
          id = parts[1] || "";
        }
      }
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
  } catch {
    return "";
  }
}

function stopPlayback() {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();

  youtube.src = "";
  youtube.hidden = true;
  $("videoPlaceholder").hidden = false;
  $("mp3Controls").hidden = true;
  $("playButton").textContent = "▶";
  $("playerStatus").textContent = "READY TO SING";
}

function renderSongs() {
  const query = $("searchInput").value.trim().toLowerCase();
  const genre = $("genreFilter").value;
  const source = $("sourceFilter").value;

  let list = songs.filter(song => {
    const matchesQuery =
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.genre.toLowerCase().includes(query);

    const matchesGenre = genre === "all" || song.genre === genre;
    const matchesSource = source === "all" || song.source === source;

    let matchesView = true;
    if (view === "favorites") matchesView = favorites.has(song.id);
    if (view === "queue") matchesView = queue.includes(song.id);

    if (selectedGenre !== "all") {
      matchesView = matchesView && song.genre === selectedGenre;
    }

    return matchesQuery && matchesGenre && matchesSource && matchesView;
  });

  $("libraryTitle").textContent = {
    all: selectedGenre === "all" ? "Discover songs" : selectedGenre + " songs",
    favorites: "Your favorites",
    queue: "Up next"
  }[view];

  $("songCount").textContent = `${list.length} song${list.length === 1 ? "" : "s"} found`;
  $("queueCount").textContent = queue.length;

  $("songGrid").innerHTML = list.map(song => {
    const playable = song.source === "youtube" || song.source === "mp3";
    const isFavorite = favorites.has(song.id);
    const isQueued = queue.includes(song.id);
    const badge = song.source === "youtube" ? "YOUTUBE" :
      song.source === "mp3" ? "MP3" : "ADD AUDIO";

    return `
      <article class="song-card">
        <div class="song-art" style="background:${song.color}">
          <button class="favorite-btn ${isFavorite ? "is-favorite" : ""}"
            data-action="favorite" data-id="${escapeHTML(song.id)}"
            title="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
            aria-label="${isFavorite ? "Remove from" : "Add to"} favorites"
            aria-pressed="${isFavorite}">${isFavorite ? "♥" : "♡"}</button>
          <span>${escapeHTML(song.emoji)}</span>
          <span class="source-badge">${badge}</span>
        </div>
        <div class="song-info">
          <h3 title="${escapeHTML(song.title)}">${escapeHTML(song.title)}</h3>
          <p title="${escapeHTML(song.artist)}">${escapeHTML(song.artist)}</p>
          <div class="song-meta">
            <span class="genre-tag">${escapeHTML(song.genre)}</span>
            <div class="song-actions">
              <button class="song-action ${isQueued ? "is-queued" : ""}"
                data-action="${isQueued ? "unqueue" : "queue"}"
                data-id="${escapeHTML(song.id)}"
                title="${isQueued ? "Remove from" : "Add to"} queue"
                aria-label="${isQueued ? "Remove" : "Add"} ${escapeHTML(song.title)} ${isQueued ? "from" : "to"} queue"
                aria-pressed="${isQueued}"><span aria-hidden="true">${isQueued ? "✓" : "＋"}</span><span>${isQueued ? "Queued" : "Queue"}</span></button>
              <button class="song-action" data-action="play"
                data-id="${escapeHTML(song.id)}" title="${playable ? "Play song" : "Add a YouTube link or MP3"}"
                aria-label="${playable ? "Play" : "Add playback for"} ${escapeHTML(song.title)}"><span aria-hidden="true">${playable ? "▶" : "＋"}</span><span>${playable ? "Sing" : "Add audio"}</span></button>
            </div>
          </div>
        </div>
      </article>`;
  }).join("");

  $("emptyState").hidden = list.length !== 0;
}

function selectSong(song) {
  if (!song) return;

  currentSong = song;
  stopPlayback();

  $("nowArt").textContent = song.emoji;
  $("nowArt").style.background = song.color;
  $("nowTitle").textContent = song.title;
  $("nowArtist").textContent = song.artist;
  $("sourceLabel").textContent =
    song.source === "youtube" ? "YOUTUBE KARAOKE" :
    song.source === "mp3" ? "LOCAL MP3 FILE" : "CATALOG ENTRY";

  if (song.source === "youtube" && song.youtubeId) {
    $("videoPlaceholder").hidden = true;
    youtube.hidden = false;
    youtube.src = `https://www.youtube-nocookie.com/embed/${song.youtubeId}?autoplay=1&rel=0`;
    $("playerStatus").textContent = "YOUTUBE PLAYER";
    $("playerMessage").textContent =
      "Use the controls inside the video to play or pause. Some videos may not allow embedding.";
    showToast("Opening karaoke video!");
  } else if (song.source === "mp3" && song.audioUrl) {
    audio.src = song.audioUrl;
    $("mp3Controls").hidden = false;
    $("playerStatus").textContent = "MP3 PLAYER";
    $("playerMessage").textContent =
      "Use the player controls below to play, pause, seek, and adjust volume.";
    audio.play().then(() => {
      $("playButton").textContent = "Ⅱ";
    }).catch(() => {
      showToast("Press play to start this audio file.");
    });
  } else {
    $("playerMessage").textContent =
      "This catalog entry has no audio attached yet. Add its YouTube karaoke link above or upload a matching MP3 file.";
    showToast("Add a playable YouTube link or MP3 for this song.");
  }
}

function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
    showToast("Removed from favorites.");
  } else {
    favorites.add(id);
    showToast("Added to favorites ♡");
  }

  saveFavorites();
  renderSongs();
}

function addToQueue(id) {
  const song = getSong(id);
  if (!song) return;

  if (queue.includes(id)) {
    showToast("This song is already in your queue.");
    return;
  }

  queue.push(id);
  renderSongs();
  showToast(`Added "${song.title}" to Up Next.`);
}

function removeFromQueue(id) {
  queue = queue.filter(queuedId => queuedId !== id);
  renderSongs();
  showToast("Removed from Up Next.");
}

function playNext() {
  // Prefer the next queued song, then wrap through the library.
  while (queue.length) {
    const id = queue.shift();
    const song = getSong(id);
    renderSongs();

    if (song) {
      selectSong(song);
      return;
    }
  }

  const index = currentSong ? songs.findIndex(s => s.id === currentSong.id) : -1;
  const next = songs[(index + 1) % songs.length];

  if (next) selectSong(next);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

// Search, genre and source filters
$("searchInput").addEventListener("input", renderSongs);
$("genreFilter").addEventListener("change", renderSongs);
$("sourceFilter").addEventListener("change", renderSongs);

$("browseButton").addEventListener("click", () => {
  $("librarySection").scrollIntoView({ behavior: "smooth" });
  $("searchInput").focus();
});

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => {
    view = button.dataset.view;
    selectedGenre = "all";
    document.querySelectorAll("[data-view]").forEach(item =>
      item.classList.toggle("active", item === button)
    );
    document.querySelectorAll(".genre-link").forEach(item =>
      item.classList.remove("active")
    );
    renderSongs();
    $("librarySection").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll("[data-genre]").forEach(button => {
  button.addEventListener("click", () => {
    view = "all";
    selectedGenre = button.dataset.genre;
    $("genreFilter").value = "all";
    document.querySelectorAll("[data-view]").forEach(item =>
      item.classList.toggle("active", item.dataset.view === "all")
    );
    document.querySelectorAll(".genre-link").forEach(item =>
      item.classList.toggle("active", item === button)
    );
    renderSongs();
    $("librarySection").scrollIntoView({ behavior: "smooth" });
  });
});

$("songGrid").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === "favorite") toggleFavorite(id);
  if (action === "queue") addToQueue(id);
  if (action === "unqueue") removeFromQueue(id);

  if (action === "play" || action === "attach") {
    const song = getSong(id);
    if (!song) return;

    if (song.source === "catalog") {
      selectSong(song);
      $("ytTitle").value = song.title;
      $("ytArtist").value = song.artist;
      $("ytGenre").value = song.genre;
      $("ytUrl").focus();
      $("youtubeForm").scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      selectSong(song);
    }
  }
});

$("clearFilters").addEventListener("click", () => {
  view = "all";
  selectedGenre = "all";
  $("searchInput").value = "";
  $("genreFilter").value = "all";
  $("sourceFilter").value = "all";
  document.querySelectorAll("[data-view]").forEach(item =>
    item.classList.toggle("active", item.dataset.view === "all")
  );
  document.querySelectorAll(".genre-link").forEach(item =>
    item.classList.remove("active")
  );
  renderSongs();
});

// Add YouTube karaoke videos using their actual video URL.
$("youtubeForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = $("ytTitle").value.trim();
  const artist = $("ytArtist").value.trim() || "Unknown artist";
  const genre = $("ytGenre").value;
  const url = $("ytUrl").value.trim();
  const youtubeId = getYouTubeId(url);

  if (!youtubeId) {
    showToast("That YouTube link looks invalid. Paste a video URL.");
    return;
  }

  if (songs.some(song =>
    song.source === "youtube" && song.youtubeId === youtubeId
  )) {
    showToast("This YouTube video is already in your library.");
    return;
  }

  const song = {
    id: "yt-" + youtubeId,
    title,
    artist,
    genre,
    emoji: "🎤",
    color: colors[songs.length % colors.length],
    source: "youtube",
    youtubeId,
    audioUrl: "",
    fileName: ""
  };

  songs.unshift(song);
  event.target.reset();
  view = "all";
  selectedGenre = "all";
  $("genreFilter").value = "all";
  $("sourceFilter").value = "all";
  document.querySelectorAll("[data-view]").forEach(item =>
    item.classList.toggle("active", item.dataset.view === "all")
  );
  renderSongs();
  selectSong(song);
  $("librarySection").scrollIntoView({ behavior: "smooth" });
  showToast("YouTube karaoke song added!");
});

// Upload multiple MP3 files. The file itself is used as the audio source.
$("mp3Input").addEventListener("change", event => {
  const files = Array.from(event.target.files || []);
  let added = 0;

  files.forEach(file => {
    const isMP3 = file.type === "audio/mpeg" || /\.mp3$/i.test(file.name);

    if (!isMP3) return;

    const duplicate = songs.some(song =>
      song.source === "mp3" &&
      song.fileName === file.name &&
      song.fileSize === file.size
    );

    if (duplicate) return;

    const title = file.name.replace(/\.mp3$/i, "").replace(/[_-]+/g, " ");

    songs.unshift({
      id: "mp3-" + crypto.randomUUID(),
      title,
      artist: "Your music",
      genre: "Other",
      emoji: "🎵",
      color: colors[songs.length % colors.length],
      source: "mp3",
      youtubeId: "",
      audioUrl: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: file.size
    });

    added++;
  });

  event.target.value = "";
  view = "all";
  selectedGenre = "all";
  $("genreFilter").value = "all";
  $("sourceFilter").value = "all";
  document.querySelectorAll("[data-view]").forEach(item =>
    item.classList.toggle("active", item.dataset.view === "all")
  );
  renderSongs();

  if (added > 0) {
    showToast(`${added} MP3 song${added === 1 ? "" : "s"} added!`);
    const first = songs.find(song => song.source === "mp3");
    if (first) selectSong(first);
  } else if (files.length) {
    showToast("No new MP3 files added. Check the file type or duplicates.");
  }
});

// MP3 player controls
$("playButton").addEventListener("click", () => {
  if (!currentSong) {
    showToast("Choose a song first.");
    return;
  }

  if (currentSong.source === "youtube") {
    showToast("Use the YouTube player's own controls.");
    return;
  }

  if (currentSong.source !== "mp3" || !audio.src) {
    showToast("Add a YouTube link or upload an MP3 first.");
    return;
  }

  if (audio.paused) {
    audio.play().then(() => {
      $("playButton").textContent = "Ⅱ";
    }).catch(() => showToast("This audio file could not be played."));
  } else {
    audio.pause();
    $("playButton").textContent = "▶";
  }
});

$("nextButton").addEventListener("click", playNext);

$("prevButton").addEventListener("click", () => {
  if (currentSong?.source === "mp3" && audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  const index = currentSong ? songs.findIndex(s => s.id === currentSong.id) : 0;
  const previous = songs[(index - 1 + songs.length) % songs.length];
  if (previous) selectSong(previous);
});

audio.addEventListener("play", () => {
  $("playButton").textContent = "Ⅱ";
  $("playerStatus").textContent = "NOW PLAYING";
});

audio.addEventListener("pause", () => {
  $("playButton").textContent = "▶";
  if (currentSong?.source === "mp3") {
    $("playerStatus").textContent = "PAUSED";
  }
});

audio.addEventListener("loadedmetadata", () => {
  $("duration").textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  $("currentTime").textContent = formatTime(audio.currentTime);
  $("seekBar").value = audio.duration
    ? (audio.currentTime / audio.duration) * 100
    : 0;
});

$("seekBar").addEventListener("input", () => {
  if (audio.duration) {
    audio.currentTime = (Number($("seekBar").value) / 100) * audio.duration;
  }
});

$("volumeBar").addEventListener("input", () => {
  audio.volume = Number($("volumeBar").value);
});

audio.addEventListener("ended", playNext);

audio.addEventListener("error", () => {
  if (currentSong?.source === "mp3") {
    $("playerMessage").textContent = "This MP3 could not be loaded. Try uploading the file again.";
    showToast("Unable to play this MP3 file.");
  }
});

// Keyboard shortcut: Ctrl/Cmd + K focuses song search.
if (navigator.platform.toLowerCase().includes("mac")) {
  $("keyboardShortcut").textContent = "⌘ K";
}

document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    $("searchInput").focus();
  }
});

renderSongs();
audio.volume = 0.8;
