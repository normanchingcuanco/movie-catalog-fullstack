<template>
  <div class="container">
    <div class="add-movie" v-if="auth.token">
      <h3>Add a Movie</h3>
      <p class="hint">Enter a title — details + poster will be fetched from OMDb.</p>

      <div class="row">
        <input
          v-model="newTitle"
          placeholder="e.g. The Dark Knight"
          @keyup.enter="addMovie"
        />
        <button id="addMovie" @click="addMovie" :disabled="isAdding">
          {{ isAdding ? "Adding..." : "Add Movie" }}
        </button>
      </div>

      <p v-if="addError" class="error">{{ addError }}</p>
      <p v-if="addSuccess" class="success">{{ addSuccess }}</p>
    </div>

    <hr />

    <div class="filter-bar">
      <input
        v-model="search"
        placeholder="Search by title..."
        @keyup.enter="applyFilters"
      />

      <input
        v-model="genre"
        placeholder="Filter by genre..."
        @keyup.enter="applyFilters"
      />

      <select v-model="sort">
        <option value="">Newest</option>
        <option value="highestRated">Highest Rated</option>
        <option value="mostLiked">Most Liked</option>
        <option value="trending">Trending</option>
      </select>

      <button @click="applyFilters">Apply</button>
      <button class="secondary" @click="resetFilters">Reset</button>
    </div>

    <div class="grid">
      <MovieCard
        v-for="movie in movies"
        :key="movie._id"
        :movie="movie"
        :watchlistIds="watchlistIds"
        @refresh="refreshAll"
        @watchlist-changed="refreshWatchlist"
      />
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
        Previous
      </button>

      <span>Page {{ currentPage }} of {{ totalPages }}</span>

      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
        Next
      </button>
    </div>
  </div>
</template>

<script>
import api from "../api"
import { useAuthStore } from "../auth"
import MovieCard from "../components/MovieCard.vue"

export default {
  components: { MovieCard },

  data() {
    return {
      movies: [],
      search: "",
      genre: "",
      sort: "",
      currentPage: 1,
      totalPages: 1,
      limit: 8,

      newTitle: "",
      isAdding: false,
      addError: "",
      addSuccess: "",

      watchlistIds: []
    }
  },

  setup() {
    const auth = useAuthStore()
    return { auth }
  },

  async mounted() {
    await this.refreshAll()
  },

  methods: {
    async fetchMovies() {
      const res = await api.get("/movies/getMovies", {
        params: {
          search: this.search,
          genre: this.genre,
          sort: this.sort,
          page: this.currentPage,
          limit: this.limit
        }
      })

      this.movies = res.data.movies || []
      this.totalPages = res.data.totalPages || 1
    },

    async refreshWatchlist() {
      if (!this.auth.token) {
        this.watchlistIds = []
        return
      }

      try {
        const res = await api.get("/movies/watchlist", {
          headers: { Authorization: `Bearer ${this.auth.token}` }
        })

        const list = res.data.watchlist || []
        this.watchlistIds = list.map((m) => String(m._id))
      } catch (e) {
        this.watchlistIds = []
      }
    },

    async refreshAll() {
      await this.fetchMovies()
      await this.refreshWatchlist()
    },

    applyFilters() {
      this.currentPage = 1
      this.fetchMovies()
    },

    resetFilters() {
      this.search = ""
      this.genre = ""
      this.sort = ""
      this.currentPage = 1
      this.fetchMovies()
    },

    changePage(page) {
      this.currentPage = page
      this.fetchMovies()
    },

    async addMovie() {
      this.addError = ""
      this.addSuccess = ""

      const title = this.newTitle.trim()
      if (!title) return

      try {
        this.isAdding = true

        await api.post(
          "/movies/addMovie",
          { title },
          { headers: { Authorization: `Bearer ${this.auth.token}` } }
        )

        this.newTitle = ""
        this.addSuccess = "Movie added!"
        this.currentPage = 1
        await this.refreshAll()
      } catch (error) {
        this.addError = error.response?.data?.message || "Failed to add movie."
      } finally {
        this.isAdding = false
      }
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}

.add-movie {
  margin-bottom: 10px;
}

.hint {
  margin: 6px 0 10px;
  color: #666;
  font-size: 13px;
}

.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.row input {
  padding: 8px;
  width: 320px;
  max-width: 100%;
}

.row button {
  padding: 8px 12px;
  cursor: pointer;
}

.error {
  color: red;
  margin-top: 8px;
  font-weight: bold;
}

.success {
  color: green;
  margin-top: 8px;
  font-weight: bold;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-bar input,
.filter-bar select {
  padding: 6px;
}

.filter-bar button {
  padding: 6px 12px;
}

.secondary {
  background: #ddd;
  border: 1px solid #ccc;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>