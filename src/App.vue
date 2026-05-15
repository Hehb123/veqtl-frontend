<template>
  <div class="app-container">
    <header class="app-header">
      <div class="nav-inner">
        <router-link class="brand" to="/">
          <span class="brand-mark">vQ</span>
          <span>
            <strong>veQTL-Atlas</strong>
            <small>Variance eQTL browser</small>
          </span>
        </router-link>

        <nav class="nav-links" aria-label="Primary navigation">
          <router-link to="/">Home</router-link>
          <router-link to="/query">Query</router-link>
          <router-link to="/trait/smr">SMR Associations</router-link>
          <router-link to="/documentation">Documentation</router-link>
          <router-link to="/download">Download</router-link>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid rgba(226, 232, 240, 0.86);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
}

.nav-inner {
  display: grid;
  grid-template-columns: auto minmax(260px, 1fr);
  align-items: center;
  gap: 24px;
  width: min(100%, 1440px);
  min-height: 72px;
  margin: 0 auto;
  padding: 0 24px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--text-strong);
  text-decoration: none;
}

.brand-mark {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #17324d;
  color: #fff;
  font-weight: 700;
}

.brand strong,
.brand small {
  display: block;
  line-height: 1.15;
}

.brand strong {
  font-size: 17px;
}

.brand small {
  margin-top: 2px;
  color: var(--muted);
  font-size: 13px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}

.nav-links a {
  padding: 9px 12px;
  border-radius: 6px;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background: var(--primary-soft);
  color: var(--primary-dark);
}

.main-content {
  min-height: calc(100vh - 72px);
}

@media (max-width: 980px) {
  .nav-inner {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 14px 16px;
  }

  .nav-links {
    width: 100%;
    overflow-x: auto;
  }
}

@media (max-width: 1180px) and (min-width: 981px) {
  .nav-inner {
    gap: 18px;
    padding: 0 18px;
  }

  .nav-links a {
    padding: 8px 9px;
    font-size: 15px;
  }
}
</style>
