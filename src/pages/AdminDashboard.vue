<template>
  <div class="container">
    <h2>Admin Dashboard</h2>

    <!-- ================= METRICS ================= -->
    <div class="cards">
      <div class="card">
        <div class="label">Total Users</div>
        <div class="value">{{ metrics.totalUsers }}</div>
      </div>

      <div class="card">
        <div class="label">Total Movies</div>
        <div class="value">{{ metrics.totalMovies }}</div>
      </div>

      <div class="card">
        <div class="label">Total Comments</div>
        <div class="value">{{ metrics.totalComments }}</div>
      </div>

      <div class="card">
        <div class="label">Total Ratings</div>
        <div class="value">{{ metrics.totalRatings }}</div>
      </div>

      <div class="card">
        <div class="label">Total Movie Likes</div>
        <div class="value">{{ metrics.totalMovieLikes }}</div>
      </div>
    </div>

    <hr />

    <!-- ================= ADD MOVIE (OMDb by Title) ================= -->
    <h3>Add Movie (OMDb)</h3>
    <div class="form">
      <input v-model="newTitle" placeholder="Enter movie title (e.g. Inception)" />
      <button id="addMovie" @click="addMovieByTitle" :disabled="isAdding">
        {{ isAdding ? "Adding..." : "Add Movie" }}
      </button>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success">{{ successMsg }}</p>
    </div>

    <hr />

    <!-- ================= MOVIES TABLE ================= -->
    <div class="section-header">
      <h3>Movies</h3>
      <button class="secondary" @click="fetchMovies" :disabled="isLoadingMovies">
        {{ isLoadingMovies ? "Refreshing..." : "Refresh" }}
      </button>
    </div>

    <table v-if="movies.length">
      <thead>
        <tr>
          <th>Title</th>
          <th>Director</th>
          <th>Year</th>
          <th>Genre</th>
          <th>Description</th>
          <th>Likes</th>
          <th>Rating</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="movie in movies" :key="movie._id">
          <td>{{ movie.title }}</td>
          <td>{{ movie.director || "—" }}</td>
          <td>{{ movie.year || "—" }}</td>
          <td>{{ movie.genre || "—" }}</td>
          <td class="description-cell">{{ movie.description || "—" }}</td>
          <td>{{ movie.likes?.length || 0 }}</td>
          <td>{{ (movie.averageRating || 0).toFixed(1) }}</td>
          <td>
            <button @click="startEdit(movie)">Update</button>
            <button @click="deleteMovie(movie._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else class="muted">No movies found.</p>

    <!-- ================= EDIT MOVIE ================= -->
    <div v-if="editingMovie" class="edit-section">
      <h3>Edit Movie</h3>

      <input v-model="editingMovie.title" placeholder="Title" />
      <input v-model="editingMovie.director" placeholder="Director" />
      <input v-model="editingMovie.year" type="number" placeholder="Year" />
      <input v-model="editingMovie.genre" placeholder="Genre" />
      <textarea v-model="editingMovie.description" placeholder="Description" />

      <div class="row">
        <button @click="updateMovie" :disabled="isSavingEdit">
          {{ isSavingEdit ? "Saving..." : "Save" }}
        </button>
        <button class="secondary" @click="editingMovie = null" :disabled="isSavingEdit">
          Cancel
        </button>
      </div>

      <p v-if="editError" class="error">{{ editError }}</p>
    </div>

    <hr />

    <!-- ================= ALL COMMENTS (ADMIN) ================= -->
    <div class="section-header">
      <h3>All Comments</h3>
      <button class="secondary" @click="fetchAllComments" :disabled="isLoadingComments">
        {{ isLoadingComments ? "Refreshing..." : "Refresh" }}
      </button>
    </div>

    <p class="muted" v-if="!allComments.length">No comments found.</p>

    <table v-if="allComments.length">
      <thead>
        <tr>
          <th>Movie</th>
          <th>User</th>
          <th>Comment</th>
          <th>Parent</th>
          <th>👍</th>
          <th>👎</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in allComments" :key="c.commentId">
          <td class="small">{{ c.movieTitle }}</td>
          <td class="small">{{ c.username }}</td>
          <td>{{ c.comment }}</td>
          <td class="small">{{ c.parentCommentId ? "Reply" : "Top-level" }}</td>
          <td class="small">{{ c.likes }}</td>
          <td class="small">{{ c.dislikes }}</td>
          <td class="small">{{ formatDate(c.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from "../api"
import { useAuthStore } from "../auth"

export default {
  data() {
    return {
      metrics: {
        totalUsers: 0,
        totalMovies: 0,
        totalComments: 0,
        totalRatings: 0,
        totalMovieLikes: 0
      },

      newTitle: "",
      isAdding: false,
      errorMsg: "",
      successMsg: "",

      movies: [],
      isLoadingMovies: false,

      editingMovie: null,
      isSavingEdit: false,
      editError: "",

      allComments: [],
      isLoadingComments: false
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
    authHeaders() {
      return { Authorization: `Bearer ${this.auth.token}` }
    },

    formatDate(value) {
      if (!value) return "—"
      const d = new Date(value)
      if (Number.isNaN(d.getTime())) return "—"
      return d.toLocaleString()
    },

    async refreshAll() {
      await this.fetchMetrics()
      await this.fetchMovies()
      await this.fetchAllComments()
    },

    async fetchMetrics() {
      try {
        const res = await api.get("/movies/admin/dashboard", {
          headers: this.authHeaders()
        })
        this.metrics = {
          totalUsers: res.data.totalUsers || 0,
          totalMovies: res.data.totalMovies || 0,
          totalComments: res.data.totalComments || 0,
          totalRatings: res.data.totalRatings || 0,
          totalMovieLikes: res.data.totalMovieLikes || 0
        }
      } catch (e) {
        this.metrics = {
          totalUsers: 0,
          totalMovies: 0,
          totalComments: 0,
          totalRatings: 0,
          totalMovieLikes: 0
        }
      }
    },

    async addMovieByTitle() {
      this.errorMsg = ""
      this.successMsg = ""

      const title = this.newTitle.trim()
      if (!title) return

      try {
        this.isAdding = true

        await api.post(
          "/movies/addMovie",
          { title },
          { headers: this.authHeaders() }
        )

        this.newTitle = ""
        this.successMsg = "Movie added successfully!"
        await this.fetchMovies()
        await this.fetchMetrics()
      } catch (error) {
        this.errorMsg = error.response?.data?.message || "Failed to add movie."
      } finally {
        this.isAdding = false
      }
    },

    async fetchMovies() {
      try {
        this.isLoadingMovies = true
        const res = await api.get("/movies/getMovies", {
          params: { page: 1, limit: 50 }
        })
        this.movies = res.data.movies || []
      } catch (e) {
        this.movies = []
      } finally {
        this.isLoadingMovies = false
      }
    },

    startEdit(movie) {
      this.editError = ""
      this.editingMovie = { ...movie }
    },

    async updateMovie() {
      if (!this.editingMovie?._id) return

      try {
        this.isSavingEdit = true
        this.editError = ""

        await api.patch(
          `/movies/updateMovie/${this.editingMovie._id}`,
          {
            title: this.editingMovie.title,
            director: this.editingMovie.director,
            year: this.editingMovie.year,
            genre: this.editingMovie.genre,
            description: this.editingMovie.description
          },
          { headers: this.authHeaders() }
        )

        this.editingMovie = null
        await this.fetchMovies()
        await this.fetchMetrics()
      } catch (error) {
        this.editError = error.response?.data?.message || "Error updating movie"
      } finally {
        this.isSavingEdit = false
      }
    },

    async deleteMovie(id) {
      if (!id) return

      try {
        await api.delete(`/movies/deleteMovie/${id}`, {
          headers: this.authHeaders()
        })
        await this.fetchMovies()
        await this.fetchMetrics()
      } catch (error) {
        this.errorMsg = error.response?.data?.message || "Error deleting movie"
      }
    },

    async fetchAllComments() {
      try {
        this.isLoadingComments = true
        const res = await api.get("/movies/admin/getAllComments", {
          headers: this.authHeaders()
        })
        this.allComments = res.data.comments || []
      } catch (e) {
        this.allComments = []
      } finally {
        this.isLoadingComments = false
      }
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.card {
  background: white;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 12px;
  min-width: 160px;
}

.label {
  font-size: 12px;
  color: #666;
}

.value {
  font-size: 22px;
  font-weight: bold;
  margin-top: 4px;
}

.form input,
.edit-section input,
.form textarea,
.edit-section textarea {
  display: block;
  margin: 8px 0;
  width: 100%;
  max-width: 520px;
  padding: 10px;
}

.form textarea,
.edit-section textarea {
  min-height: 90px;
}

.row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.error {
  color: red;
  font-weight: bold;
  margin-top: 8px;
}

.success {
  color: green;
  font-weight: bold;
  margin-top: 8px;
}

.muted {
  color: #666;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
  vertical-align: top;
}

.description-cell {
  max-width: 340px;
  word-wrap: break-word;
}

.small {
  font-size: 12px;
  color: #444;
}

button {
  cursor: pointer;
  padding: 7px 10px;
}

.secondary {
  background: #eee;
  border: 1px solid #ccc;
}
</style>