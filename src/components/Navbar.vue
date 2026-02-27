<template>
  <nav>
    <router-link v-if="auth.token" to="/movies">Movies</router-link>
    <router-link v-if="auth.token" to="/watchlist">Watchlist</router-link>

    <router-link v-if="auth.token && auth.isAdmin" to="/admin">
      Admin
    </router-link>

    <router-link v-if="!auth.token" to="/login">Login</router-link>
    <router-link v-if="!auth.token" to="/register">Register</router-link>

    <button v-if="auth.token" @click="logout">Logout</button>
  </nav>
</template>

<script>
import { useAuthStore } from "../auth"

export default {
  setup() {
    const auth = useAuthStore()

    const logout = () => {
      auth.logout()
      window.location.href = "/login"
    }

    return { auth, logout }
  }
}
</script>

<style>
nav {
  background: #222;
  padding: 15px;
}
a {
  color: white;
  margin-right: 15px;
  text-decoration: none;
}
button {
  background: red;
  color: white;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
}
</style>