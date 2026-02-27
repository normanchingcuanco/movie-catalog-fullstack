<template>
  <div class="card">
    <img :src="posterSrc" alt="Poster" class="poster" />

    <div class="card-content">
      <h3>{{ movie.title }}</h3>

      <p class="meta">
        <strong>{{ movie.year || "—" }}</strong> • {{ movie.genre || "—" }}
      </p>

      <p class="description">{{ truncatedDescription }}</p>

      <div class="stats">
        <span>⭐ {{ (movie.averageRating || 0).toFixed(1) }}</span>
        <span>❤️ {{ movie.likes?.length || 0 }}</span>
        <span>🗳 {{ movie.ratings?.length || 0 }}</span>
      </div>

      <div v-if="auth.token" class="actions">
        <button @click="toggleLike" :disabled="isBusy">
          {{ hasLiked ? "Unlike ❤️" : "Like ❤️" }}
        </button>

        <button @click="toggleWatchlist" :disabled="isBusy">
          {{ inWatchlist ? "Remove 📌" : "Watchlist 📌" }}
        </button>

        <select v-model="selectedRating" @change="rateMovie" :disabled="isBusy">
          <option disabled value="">Rate</option>
          <option v-for="n in 5" :key="n" :value="n">
            {{ n }} ⭐
          </option>
        </select>
      </div>

      <router-link :to="`/movies/${movie._id}`">
        <button class="view-btn">View Movie</button>
      </router-link>
    </div>
  </div>
</template>

<script>
import api from "../api"
import { useAuthStore } from "../auth"

export default {
  props: ["movie", "watchlistIds"],

  data() {
    return {
      selectedRating: "",
      isBusy: false
    }
  },

  setup() {
    const auth = useAuthStore()
    return { auth }
  },

  computed: {
    posterSrc() {
      return (
        this.movie.posterUrl ||
        "https://via.placeholder.com/300x450?text=No+Poster"
      )
    },

    truncatedDescription() {
      if (!this.movie.description) return ""
      return this.movie.description.length > 110
        ? this.movie.description.substring(0, 110) + "..."
        : this.movie.description
    },

    hasLiked() {
      const userId = String(this.auth.userId || "")
      return (this.movie.likes || []).some((id) => String(id) === userId)
    },

    inWatchlist() {
      const movieId = String(this.movie?._id || "")
      const ids = (this.watchlistIds || []).map((id) => String(id))
      return ids.includes(movieId)
    }
  },

  methods: {
    async toggleLike() {
      if (!this.auth.token) return

      try {
        this.isBusy = true
        await api.patch(
          `/movies/likeMovie/${this.movie._id}`,
          {},
          { headers: { Authorization: `Bearer ${this.auth.token}` } }
        )
        this.$emit("refresh")
      } catch (e) {
        // ignore UI noise
      } finally {
        this.isBusy = false
      }
    },

    async rateMovie() {
      if (!this.auth.token || !this.selectedRating) return

      try {
        this.isBusy = true
        await api.patch(
          `/movies/rateMovie/${this.movie._id}`,
          { value: Number(this.selectedRating) },
          { headers: { Authorization: `Bearer ${this.auth.token}` } }
        )
        this.selectedRating = ""
        this.$emit("refresh")
      } catch (e) {
        // ignore UI noise
      } finally {
        this.isBusy = false
      }
    },

    async toggleWatchlist() {
      if (!this.auth.token) return

      try {
        this.isBusy = true
        await api.patch(
          `/movies/watchlist/${this.movie._id}`,
          {},
          { headers: { Authorization: `Bearer ${this.auth.token}` } }
        )

        this.$emit("watchlist-changed")
        this.$emit("refresh")
      } catch (e) {
        // ignore UI noise
      } finally {
        this.isBusy = false
      }
    }
  }
}
</script>

<style>
.card {
  background: white;
  border-radius: 10px;
  width: 260px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.poster {
  width: 100%;
  height: 350px;
  object-fit: cover;
}

.card-content {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta {
  font-size: 13px;
  color: #666;
}

.description {
  font-size: 14px;
  color: #444;
}

.stats {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-top: 6px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.view-btn {
  margin-top: 10px;
  padding: 6px;
  cursor: pointer;
}
</style>