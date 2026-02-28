<template>
  <div class="auth-wrapper">
    <div class="auth-card">

      <div class="auth-heading">
        <span>Welcome Back to</span>
        <img
          src="/logo_reeltalk.png"
          alt="ReelTalk"
          class="auth-logo-inline"
        />
      </div>

      <form @submit.prevent="login" class="auth-form">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />

        <button type="submit" class="primary full-btn" :disabled="isLoading">
          {{ isLoading ? "Logging in..." : "Login" }}
        </button>

        <p class="auth-footer">
          Don’t have an account?
          <router-link to="/register">Register</router-link>
        </p>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      </form>

    </div>
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

.auth-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #F5F5DC;
}

.auth-card {
  width: 380px;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.08);
  text-align: center;
}

.auth-heading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 30px;
  font-weight: 600;
}

.auth-heading span {
  font-size: 20px;
}

.auth-logo-inline {
  height: 70px;
  margin-top: 3px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.auth-form input {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #ddd;
}

.full-btn {
  width: 100%;
  padding: 12px;
  border-radius: 999px;
}

.auth-footer {
  margin-top: 10px;
  font-size: 14px;
}

.auth-footer a {
  color: #E35336;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.error {
  color: red;
  margin-top: 8px;
}

</style>
