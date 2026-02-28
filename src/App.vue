<template>
  <div class="layout">

    <Sidebar v-if="auth.token" />

    <div class="main-content">
      <router-view />
    </div>

  </div>
</template>

<script>
import { useAuthStore } from "./auth"
import Sidebar from "./components/Navbar.vue"

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
  transition: all 0.3s ease;
}

/* ================= MOBILE FIX ================= */
@media (max-width: 768px) {

  .layout {
    flex-direction: column;
  }

  /* Add LEFT SPACE so burger does not cover title */
  .main-content {
    padding: 90px 16px 20px 60px;
  }

}

</style>