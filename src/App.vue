<template>
  <div class="layout" :class="{ 'with-sidebar': auth.token }">
    <Sidebar v-if="auth.userId" />

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

/* Desktop layout */
.main-content {
  flex: 1;
  padding: 40px;
  margin-left: 120px; /* sidebar width */
  transition: all 0.3s ease;
}

/* Mobile */
@media (max-width: 1024px) {

  .main-content {
    margin-left: 0;
    padding: 90px 16px 20px 16px;
  }

}

</style>