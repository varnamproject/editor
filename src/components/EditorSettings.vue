<template>
  <div>
    <v-card flat tile>
      <v-card-title>Editor</v-card-title>
      <v-card-text>
          <v-text-field
            type="number"
            v-model="fontSize"
            label="Font Size"
            outlined
            :hide-details="true"
          ></v-text-field>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'EditorSettings',

  data () {
    return {
    }
  },

  computed: {
    fontSize: {
      get () {
        return this.$store.state.settings.fontSize
      },
      set (value) {
        this.$store.commit('updateSettings', {
          fontSize: value
        })
      }
    }
  },

  methods: {
    init () {

    }
  },
  mounted () {
    this.init()
  }
}
</script>
