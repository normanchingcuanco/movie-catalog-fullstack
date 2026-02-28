<template>
  <div class="container auth-container">
    <h2>Create Your ReelTalk Account</h2>

    <form @submit.prevent="register" class="auth-form">

      <input
        v-model="username"
        type="text"
        placeholder="Username"
        required
      />

      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />

      <button class="primary" type="submit">
        Register
      </button>

      <p class="auth-switch">
        Already have an account?
        <router-link to="/login">Login</router-link>
      </p>

    </form>
  </div>
</template>

<script>
import api from "../api"

export default {
  data() {
    return {
      username: "",
      email: "",
      password: ""
    }
  },
  methods: {
    async register() {
      await api.post("/users/register", {
        username: this.username,
        email: this.email,
        password: this.password
      })

      alert("Registered successfully")
      this.$router.push("/login")
    }
  }
}
</script>

<style>
.container {
  padding: 20px;
}
input {
  display: block;
  margin: 8px 0;
  padding: 8px;
  width: 280px;
}
</style>