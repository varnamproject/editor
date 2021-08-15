<template>
  <div>
    <v-toolbar>
      <v-toolbar-title class="title">
        <router-link to="/" class="primary--text text-decoration-none">
          Varnam
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-row align="end" justify="end" dense>
        <v-col lg="5" md="5" sm="5">
          <v-select
            :items="langs"
            :hide-details="true"
            v-model="lang"
            label="Language"
            outlined
            dense
          ></v-select>
        </v-col>
      </v-row>
      <v-btn v-if="$route.name == 'Home'" to="/settings" color="primary" class="ma-2" depressed>
        <v-icon :left="icon">mdi-cog</v-icon>
        <span v-show="iconText">Settings</span>
      </v-btn>
      <v-btn v-else to="/" color="primary" class="ma-2" depressed>
        <v-icon :left="icon">mdi-arrow-left</v-icon>
        <span v-show="iconText">Back</span>
      </v-btn>
      <v-btn to="/scheme" color="primary" class="ma-2" depressed>
        <v-icon :left="icon">mdi-information-outline</v-icon>
        <span v-show="iconText">Help</span>
      </v-btn>
    </v-toolbar>
  </div>
</template>

<script>
export default {
  name: 'Navbar',

  data () {
    return {}
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
    },

    icon () {
      return {
        xs: false,
        sm: false,
        md: true,
        lg: true,
        xl: true
      }[this.$vuetify.breakpoint.name]
    },

    iconText () {
      return {
        xs: false,
        sm: false,
        md: true,
        lg: true,
        xl: true
      }[this.$vuetify.breakpoint.name]
    }
  }
}
</script>
