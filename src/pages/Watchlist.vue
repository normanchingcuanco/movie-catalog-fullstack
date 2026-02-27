<template>
  <div class="container">
    <h2>My Watchlist</h2>

    <div v-if="watchlist.length" class="grid">
      <MovieCard
        v-for="movie in watchlist"
        :key="movie._id"
        :movie="movie"
        :watchlistIds="watchlistIds"
        @refresh="refreshAll"
        @watchlist-changed="refreshAll"
      />
    </div>

    <p v-else>No movies in your watchlist yet.</p>
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
      watchlist: [],
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
    async refreshAll() {
      const res = await api.get("/movies/watchlist", {
        headers: { Authorization: `Bearer ${this.auth.token}` }
      })

      this.watchlist = res.data.watchlist || []
      this.watchlistIds = this.watchlist.map((m) => String(m._id))
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}
.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>