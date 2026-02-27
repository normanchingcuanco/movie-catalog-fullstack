<template>
  <div class="container">
    <h2>Login</h2>

    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Logging in..." : "Login" }}
      </button>

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../auth"

export default {
  setup() {
    const auth = useAuthStore()
    const router = useRouter()

    const email = ref("")
    const password = ref("")
    const errorMsg = ref("")
    const isLoading = ref(false)

    const login = async () => {
      errorMsg.value = ""
      isLoading.value = true

      try {
        await auth.login(email.value, password.value)

        // sanity check: token must exist now
        if (!auth.token) {
          throw new Error("Token was not saved. Please try again.")
        }

        router.push("/movies")
      } catch (e) {
        errorMsg.value = e?.message || "Login failed."
      } finally {
        isLoading.value = false
      }
    }

    return { email, password, login, errorMsg, isLoading }
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
.error {
  margin-top: 10px;
  color: red;
  font-weight: bold;
}
</style>