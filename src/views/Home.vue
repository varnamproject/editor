<template>
  <div class="home">
    <v-container class="main" :fluid="fluid">
      <Editor />
    </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
import Editor from '@/components/Editor.vue'

export default {
  name: 'Home',
  components: {
    Editor
  },
  computed: {
    fluid () {
      const b = this.$vuetify.breakpoint.name
      if (b === 'md' || b === 'sm' || b === 'xs') return true
      return false
    }
  }
}
</script>

<style scoped>
</style>
