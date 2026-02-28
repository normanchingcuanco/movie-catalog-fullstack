<template>
  <div>

    <!-- Desktop Sidebar -->
    <aside
      class="sidebar"
      @mouseenter="expanded = true"
      @mouseleave="expanded = false"
      :class="{ expanded: expanded }"
    >

      <!-- Logo -->
      <div class="logo">
        <img src="/logo_reeltalk.png" alt="ReelTalk" />
      </div>

      <!-- Nav Links -->
      <nav>
        <router-link to="/movies">
          🎬 <span v-if="expanded">Movies</span>
        </router-link>

        <router-link to="/watchlist">
          ⭐ <span v-if="expanded">Watchlist</span>
        </router-link>

        <router-link
          v-if="auth.isAdmin"
          to="/admin"
        >
          🛠 <span v-if="expanded">Admin</span>
        </router-link>

        <button @click="logout">
          🚪 <span v-if="expanded">Logout</span>
        </button>
      </nav>

    </aside>

    <!-- Mobile Hamburger -->
    <button class="hamburger" @click="toggleMobile">
      ☰
    </button>

    <div v-if="showMobile" class="mobile-drawer">
      <router-link @click="closeMobile" to="/movies">Movies</router-link>
      <router-link @click="closeMobile" to="/watchlist">Watchlist</router-link>
      <router-link
        v-if="auth.isAdmin"
        @click="closeMobile"
        to="/admin"
      >
        Admin
      </router-link>

      <button @click="logout">Logout</button>
    </div>

  </div>
</template>

<script>
import { useAuthStore } from "../auth"

export default {
  setup() {
    const auth = useAuthStore()
    return { auth }
  },

  data() {
    return {
      showMobile: false,
      expanded: false
    }
  },

  methods: {
    logout() {
      this.auth.logout()
      window.location.href = "/login"
    },

    toggleMobile() {
      this.showMobile = !this.showMobile
    },

    closeMobile() {
      this.showMobile = false
    }
  }
}
</script>

<style>
.sidebar {
  position: fixed;
  height: 100vh;
  width: 80px;
  background: linear-gradient(180deg, #A14428, #E35336);
  padding: 20px 10px;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1000;
}

.sidebar:hover {
  width: 220px;
}

.logo img {
  width: 160px;
  transition: all 0.3s ease;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 40px;
}

.sidebar a {
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.logout {
  margin-top: auto;
}
</style>