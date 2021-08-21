<template>
  <div v-if="list">
    <v-list-item>
      <v-btn v-if="$route.name == 'Home'" to="/settings" color="primary" depressed block>
        <v-icon :left="icon">mdi-cog</v-icon>
        <span v-show="iconText">Settings</span>
      </v-btn>
      <v-btn v-else to="/" color="primary" depressed block>
        <v-icon :left="icon">mdi-arrow-left</v-icon>
        <span v-show="iconText">Back</span>
      </v-btn>
    </v-list-item>
    <v-list-item>
      <v-btn to="/scheme" color="primary" depressed block>
        <v-icon :left="icon">mdi-information-outline</v-icon>
        <span v-show="iconText">Help</span>
      </v-btn>
    </v-list-item>
  </div>
  <div v-else>
    <v-btn v-if="$route.name == 'Home'" to="/settings" color="primary" depressed class="ma-2" >
      <v-icon :left="icon">mdi-cog</v-icon>
      <span v-show="iconText">Settings</span>
    </v-btn>
    <v-btn v-else to="/" color="primary" depressed class="ma-2">
      <v-icon :left="icon">mdi-arrow-left</v-icon>
      <span v-show="iconText">Back</span>
    </v-btn>
    <v-btn to="/scheme" color="primary" depressed class="ma-2">
      <v-icon :left="icon">mdi-information-outline</v-icon>
      <span v-show="iconText">Help</span>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'NavbarButtons',
  props: {
    list: {
      default: true
    }
  },
  computed: {
    icon () {
      return {
        xs: this.list,
        sm: this.list,
        md: true,
        lg: true,
        xl: true
      }[this.$vuetify.breakpoint.name]
    },

    iconText () {
      return {
        xs: this.list,
        sm: this.list,
        md: true,
        lg: true,
        xl: true
      }[this.$vuetify.breakpoint.name]
    }
  }
}
</script>
