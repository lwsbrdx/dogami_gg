<script lang="ts" setup>
</script>

<template>
  <div id="view">
    <aside>
      <div class="aside-links">
        <RouterLink class="aside-link" to="/">Home</RouterLink>
        <RouterLink class="aside-link" to="/training">Training Simulator</RouterLink>
        <RouterLink class="aside-link" to="/compare">Compare Dogamis</RouterLink>
        <RouterLink class="aside-link" to="/settings">Settings</RouterLink>
      </div>
    </aside>
    <main id="main">
      <RouterView />
    </main>
  </div>
</template>

<style lang="scss" scoped>
#view {
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 100%;

  &>aside {
    display: flex;
    flex-direction: column;
    align-items: baseline;
    width: 200px;
    border-right: 1px solid rgb(15, 24, 37);
  }

  .aside-link {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 50px;
    background-color: rgba(27, 38, 54, 1);
    color: white;

    &:hover {
      background-color: rgb(15, 24, 37);
    }

    &s {
      position: sticky;
      top: 0;
      width: 100%;
    }
  }
}

#main {
  padding: 20px;
  width: calc(100% - 250px);
}
</style>
