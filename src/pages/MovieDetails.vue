<template>
  <div v-if="movie" class="container">
    <div class="movie-header">
      <img v-if="movie.posterUrl" :src="movie.posterUrl" class="poster" />

      <div class="movie-info">
        <h2>{{ movie.title }}</h2>

        <p><strong>Director:</strong> {{ movie.director }}</p>
        <p><strong>Year:</strong> {{ movie.year }}</p>
        <p><strong>Genre:</strong> {{ movie.genre }}</p>

        <p class="description">{{ movie.description }}</p>

        <div class="stats">
          <span>⭐ {{ formattedRating }}</span>
          <span>❤️ {{ movie.likes?.length || 0 }}</span>
          <span>🗳 {{ movie.ratings?.length || 0 }} ratings</span>
        </div>

        <div v-if="auth.token" class="actions">
          <button @click="toggleLike">
            {{ hasLiked ? "Unlike ❤️" : "Like ❤️" }}
          </button>

          <button @click="toggleWatchlist">
            {{ inWatchlist ? "Remove 📌" : "Add to Watchlist 📌" }}
          </button>

          <select v-model="selectedRating" @change="rateMovie">
            <option disabled value="">Rate Movie</option>
            <option v-for="n in 5" :key="n" :value="n">
              {{ n }} ⭐
            </option>
          </select>
        </div>
      </div>
    </div>

    <hr />

    <h3>Comments</h3>

    <div v-if="auth.token">
      <textarea v-model="newComment" placeholder="Write a comment..." />
      <button id="addComment" @click="addComment">Add Comment</button>
    </div>

    <div v-else>
      <p>Please login to comment.</p>
    </div>

    <hr />

    <div v-if="threadedComments.length">
      <CommentItem
        v-for="c in threadedComments"
        :key="c._id"
        :comment="c"
        :movieId="movie._id"
        @refresh="refreshAll"
      />
    </div>

    <div v-else>
      <p>No comments yet.</p>
    </div>
  </div>
</template>

<script>
import api from "../api"
import { useAuthStore } from "../auth"
import CommentItem from "../components/CommentItem.vue"

export default {
  components: { CommentItem },

  data() {
    return {
      movie: null,
      newComment: "",
      threadedComments: [],
      selectedRating: "",
      watchlistIds: []
    }
  },

  setup() {
    const auth = useAuthStore()
    return { auth }
  },

  computed: {
    formattedRating() {
      return this.movie?.averageRating
        ? Number(this.movie.averageRating).toFixed(1)
        : 0
    },

    hasLiked() {
      const userId = String(this.auth.userId || "")
      return (this.movie?.likes || []).some((id) => String(id) === userId)
    },

    inWatchlist() {
      const movieId = String(this.movie?._id || "")
      const ids = (this.watchlistIds || []).map((id) => String(id))
      return ids.includes(movieId)
    }
  },

  async mounted() {
    await this.refreshAll()
    if (this.auth.token) {
      await this.fetchWatchlist()
    }
  },

  methods: {
    async fetchMovie() {
      const res = await api.get(`/movies/getMovie/${this.$route.params.id}`)
      this.movie = res.data.movie
    },

    async fetchComments() {
      const res = await api.get(`/movies/getComments/${this.$route.params.id}`)
      this.threadedComments = res.data.threadedComments || []
    },

    async fetchWatchlist() {
      const res = await api.get("/movies/watchlist", {
        headers: { Authorization: `Bearer ${this.auth.token}` }
      })

      const list = res.data.watchlist || []
      this.watchlistIds = list.map((m) => String(m._id))
    },

    async refreshAll() {
      await this.fetchMovie()
      await this.fetchComments()
    },

    async toggleLike() {
      await api.patch(
        `/movies/likeMovie/${this.movie._id}`,
        {},
        { headers: { Authorization: `Bearer ${this.auth.token}` } }
      )
      await this.fetchMovie()
    },

    async rateMovie() {
      if (!this.selectedRating) return

      await api.patch(
        `/movies/rateMovie/${this.movie._id}`,
        { value: Number(this.selectedRating) },
        { headers: { Authorization: `Bearer ${this.auth.token}` } }
      )

      this.selectedRating = ""
      await this.fetchMovie()
    },

    async toggleWatchlist() {
      await api.patch(
        `/movies/watchlist/${this.movie._id}`,
        {},
        { headers: { Authorization: `Bearer ${this.auth.token}` } }
      )
      await this.fetchWatchlist()
    },

    async addComment() {
      if (!this.newComment.trim()) return

      await api.patch(
        `/movies/addComment/${this.movie._id}`,
        { comment: this.newComment },
        { headers: { Authorization: `Bearer ${this.auth.token}` } }
      )

      this.newComment = ""
      await this.fetchComments()
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}

.movie-header {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.poster {
  width: 280px;
  height: 420px;
  object-fit: cover;
}

.movie-info {
  max-width: 600px;
}

.description {
  margin-top: 10px;
}

.stats {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

textarea {
  width: 100%;
  min-height: 80px;
  margin-top: 8px;
}

button {
  cursor: pointer;
}
</style>