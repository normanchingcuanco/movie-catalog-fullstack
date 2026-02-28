<template>
  <div class="layout">

    <!-- Sidebar only if logged in -->
    <Sidebar v-if="auth.token" />

    <div
      class="main-content"
      :class="{ 'with-sidebar': auth.token }"
    >
      <router-view />
    </div>

  </div>
</template>

<script>
import { useAuthStore } from "./auth"
import Sidebar from "./components/Navbar.vue" // we'll convert this

export default {
  components: { Sidebar },

  setup() {
    const auth = useAuthStore()
    return { auth }
  }
}
</script>

<style>
.layout {
  display: flex;
  min-height: 100vh;
  background: #F5F5DC;
}

.main-content {
  flex: 1;
  padding: 40px;
  margin-left: 80px;
  transition: margin-left 0.3s ease;
}

.sidebar.expanded ~ .main-content {
  margin-left: 240px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 80px 20px 20px 20px;
  }
}
</style>