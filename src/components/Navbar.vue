<template>
  <div>
    <v-toolbar>
      <v-app-bar-nav-icon class="primary--text" @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="title">
        <router-link to="/" class="primary--text text-decoration-none">
          Varnam
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-select
        :items="langs"
        :hide-details="true"
        v-model="lang"
        label="Language"
        outlined
        dense
        class="flex-grow-0 flex-shrink-1 d-none d-sm-block"
      ></v-select>
      <NavbarButtons :list="false" />
    </v-toolbar>
    <v-navigation-drawer app v-model="drawer" class="primary--text">
      <v-list>
        <v-list-item @click="drawer = !drawer">
          <v-app-bar-nav-icon class="primary--text"></v-app-bar-nav-icon>
          <span class="primary--text text-decoration-none">
            Varnam
          </span>
        </v-list-item>
        <v-list-item class="mt-4">
          <v-select
            :items="langs"
            :hide-details="true"
            v-model="lang"
            label="Language"
            outlined
            dense
            class="flex-grow-0 flex-shrink-1"
          ></v-select>
        </v-list-item>
        <NavbarButtons :list="true" class="mt-4" />
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import NavbarButtons from './NavbarButtons.vue'
export default {
  components: { NavbarButtons },
  name: 'Navbar',

  data () {
    return {
      drawer: false
    }
  },

  computed: {
    langs: function () {
      const items = []
      this.$store.state.langs.forEach(langInfo => {
        items.push({
          text: langInfo.DisplayName,
          value: langInfo.Identifier
        })
      })
      return items
    },

    lang: {
      get () {
        return this.$store.state.settings.lang
      },
      set (value) {
        this.$store.commit('updateSettings', {
          lang: value
        })
      }
    }
  }
}
</script>
