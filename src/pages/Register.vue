<template>
  <div class="container">
    <h2>Register</h2>

    <form @submit.prevent="register">
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Register</button>
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