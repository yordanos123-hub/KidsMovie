// 🔑 1. API CONFIGURATION
const API_KEY = '4e0a16faa1480aece0d9f0c1d37923c9'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// 🎬 YOUR SPECIAL LOCAL DATABASE (Fixed Images)
const localMovies = [
    {
        title: "Frozen",
        year: 2013,
        category: "Disney",
        rating: "8.0",
        image: "image.png", 
        description: "Anna sets off on an epic journey to find her sister Elsa, whose icy powers have trapped the kingdom in eternal winter.",
        trailer: "https://www.youtube.com/embed/TbQm5doF_Uc",
        featured: true
    },
    {
        title: "Toy Story",
        year: 1995,
        category: "Pixar",
        rating: "8.3",
        image: "toy-story.jpg",
        description: "A cowboy doll is threatened and jealous when a new spaceman figure supplants him as top toy in a boy's room.",
        trailer: "https://www.youtube.com/embed/v-PjgYDrg70",
        featured: true
    },
    {
        title: "Moana",
        year: 2016,
        category: "Disney",
        rating: "7.6",
        image: "moana1.jpg",
        description: "A young girl sails out on a daring mission to save her people and discovers her own identity.",
        trailer: "https://www.youtube.com/embed/LKFuXETZUsI",
        featured: true
    },
    {
        title: "Coco",
        year: 2017,
        category: "Pixar",
        rating: "8.4",
        image: "coco.jpg",
        description: "Miguel enters the Land of the Dead to find his great-great-grandfather, a legendary musician.",
        trailer: "https://www.youtube.com/embed/xlnPHQ7sPQU",
        featured: true
    },
    {
        title: "Doraemon",
        year: 2005,
        category: "Anime Kids",
        rating: "7.5",
        image: "doraemon.png",
        description: "A robotic cat from the 22nd century travels back in time to help a young boy named Nobita.",
        trailer: "https://www.youtube.com/embed/7V6-T_t0iSg",
        featured: false
    }
];

// 🎯 SELECT ELEMENTS
const movieGrid = document.getElementById("movieGrid");
const featuredRow = document.getElementById("featuredRow");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const categoryCards = document.querySelectorAll(".category-grid .card");
const modal = document.getElementById("movieModal");
const modalBody = document.getElementById("modalBody");

// 🎬 INITIAL LOAD
window.onload = () => {
    // Show Local Featured movies in top row
    const otherFeatured = localMovies.filter(m => m.featured && m.title !== "Frozen");
    displayMovies(otherFeatured, featuredRow, false);

    // Initial load of popular animation movies from API
    fetchMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16&sort_by=popularity.desc`);
};

// 🌐 FETCH FROM API
async function fetchMovies(url) {
    const res = await fetch(url);
    const data = await res.json();
    displayMovies(data.results, movieGrid, true);
}

// 🎬 DISPLAY FUNCTION
function displayMovies(movies, container, isApiData) {
    // Clear only when starting a search or changing categories
    if (container === movieGrid && (searchInput.value !== "" || !isApiData)) {
        // container.innerHTML = ""; // Handled in the search function now
    }

    movies.forEach(movie => {
        const title = isApiData ? movie.title : movie.title;
        const poster = isApiData ? (IMG_URL + movie.poster_path) : movie.image;
        const rating = isApiData ? movie.vote_average : movie.rating;
        const year = isApiData ? (movie.release_date ? movie.release_date.split('-')[0] : 'N/A') : movie.year;

        if (isApiData && !movie.poster_path) return; 

        const card = document.createElement("div");
        card.classList.add("movie-card");
        card.innerHTML = `
            <img src="${poster}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <p>${year} • ⭐ ${rating}</p>
            </div>
        `;
        
        card.addEventListener("click", () => {
            if (isApiData) getApiMovieDetails(movie.id);
            else openModal({
                title: title,
                release_date: year,
                vote_average: rating,
                overview: movie.description,
                trailer: movie.trailer
            });
        });
        
        container.appendChild(card);
    });
}

// 🔍 THE SEARCH LOGIC (FIXED)
async function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length > 0) {
        // 1. CLEAR THE ENTIRE GRID IMMEDIATELY
        movieGrid.innerHTML = "";

        // 2. SEARCH LOCAL (Your Moana/Frozen posters)
        const localMatches = localMovies.filter(m => m.title.toLowerCase().includes(query));
        if (localMatches.length > 0) {
            displayMovies(localMatches, movieGrid, false);
        }

        // 3. SEARCH API (Thousands of movies)
        const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
        const data = await res.json();
        
        // Filter results for Animation (16)
        const apiMatches = data.results.filter(m => m.genre_ids && m.genre_ids.includes(16));
        displayMovies(apiMatches, movieGrid, true);

        // 4. SCROLL TO RESULTS
        movieGrid.scrollIntoView({ behavior: 'smooth' });

    } else {
        // If query is empty, reload the popular page
        movieGrid.innerHTML = "";
        fetchMovies(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16`);
    }
}

// 🍿 API DETAILS (Trailer)
async function getApiMovieDetails(id) {
    const detailRes = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
    const movie = await detailRes.json();
    const videoRes = await fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`);
    const videoData = await videoRes.json();
    const trailer = videoData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    
    openModal({
        title: movie.title,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        overview: movie.overview,
        trailer: trailer ? `https://www.youtube.com/embed/${trailer.key}` : ""
    });
}

// 📺 OPEN POPUP
function openModal(movie) {
    modalBody.innerHTML = `
        <div class="modal-info">
            <h2 style="color: #ffcc00; margin-bottom:10px;">${movie.title}</h2>
            <p>⭐ ${movie.vote_average} | ${movie.release_date}</p>
            <p style="margin: 15px 0;">${movie.overview || movie.description}</p>
            <div class="video-container">
                ${movie.trailer ? `<iframe src="${movie.trailer}?autoplay=1" frameborder="0" allowfullscreen></iframe>` : `<p>No trailer available</p>`}
            </div>
        </div>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

// 🖱️ CATEGORY FILTER
categoryCards.forEach(card => {
    card.addEventListener("click", () => {
        searchInput.value = ""; 
        const category = card.innerText;
        let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16`;

        categoryCards.forEach(c => c.style.background = "#1e293b");
        card.style.background = "#ff4757";

        if (category === "Disney") url += "&with_companies=2";
        if (category === "Pixar") url += "&with_companies=3";
        if (category === "Anime Kids") url += "&with_original_language=ja";
        if (category === "Educational") url += "&certification_country=US&certification=G";

        movieGrid.innerHTML = "";
        fetchMovies(url);
    });
});

// ⌨️ SEARCH LISTENERS
// This makes it work when you click the button
searchBtn.addEventListener("click", handleSearch);

// This makes it work when you press 'Enter' on your keyboard
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSearch();
    }
});

// ❌ CLOSE MODAL
document.querySelector(".close-btn").onclick = () => { 
    modal.style.display = "none"; 
    modalBody.innerHTML = ""; 
    document.body.style.overflow = "auto"; 
}
window.onclick = (e) => { if (e.target == modal) { modal.style.display = "none"; modalBody.innerHTML = ""; document.body.style.overflow = "auto"; } }