<template>
  <v-container fluid>
    <v-layout row class="d-flex justify-center">
      <v-flex xs11 xl6>
        <v-tabs v-model="tab" :grow="true">
          <v-tabs-slider></v-tabs-slider>
          <v-tab href="#scheme">
            <v-icon>lead-pencil</v-icon>
            Scheme
          </v-tab>
          <v-tab href="#credits">
            <v-icon>lead-pencil</v-icon>
            Credits
          </v-tab>
          <v-tab-item value="scheme">
            <v-card>
              <v-card-text>
                <p>This page shows which key is mapped to each letter.<br/>
                <b>"Primary"</b> is the <b>highest</b> priority primary key combination for a letter.<br/>
                <b>"Secondary"</b> is only a secondary key for a letter.</p>
              </v-card-text>
              <v-card-title>
                <v-btn color="primary" @click="toggleAllGroups">{{groupsOpened > 0 ? "Close All" : "Open All"}}</v-btn>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
              <v-data-table :headers="headers" :items="definitions" :items-per-page="-1" group-by="Category" :search="search" dense>
                <template v-slot:group.header="{ group, headers, toggle, isOpen }">
                  <td :colspan="headers.length">
                    <v-btn @click="() => {toggle();updateGroupsOpen();}" x-small icon :ref="group" v-bind:opened="isOpen">
                      <v-icon v-if="isOpen">mdi-minus</v-icon>
                      <v-icon v-else>mdi-plus</v-icon>
                    </v-btn>
                    <span class="mx-5 font-weight-bold">{{ group }}</span>
                  </td>
                </template>
              </v-data-table>
            </v-card>
          </v-tab-item>
          <v-tab-item value="credits">
            <v-simple-table>
              <template v-slot:default>
                <tbody>
                  <tr
                    v-for="key in Object.keys(details)"
                    :key="key"
                  >
                    <td>{{ key }}</td>
                    <td>{{ details[key] }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout><br/>
    <v-divider></v-divider>
    <Footer />
  </v-container>
</template>

<script>
import Footer from '@/components/Footer.vue'

export default {
  name: 'Settings',

  components: {
    Footer
  },

  data () {
    return {
      details: {},
      definitions: [],
      headers: [
        {
          text: 'Letter',
          align: 'start',
          value: 'Letter',
          groupable: true,
          width: '10%'
        },
        {
          text: 'Primary',
          value: 'Exact',
          width: '20%'
        },
        {
          text: 'Secondary',
          value: 'Possibility',
          width: '20%'
        },
        {
          text: ''
        }
      ],
      search: '',
      groupsOpened: 1 // Since default is all opened, we do a close in init()
    }
  },

  computed: {
    tab: {
      set (tab) {
        this.$router.replace({
          query: { ...this.$route.query, tab }
        })
      },
      get () {
        return this.$route.query.tab
      }
    },
    vtab: {
      set (vtab) {
        this.$router.replace({
          query: { ...this.$route.query, vtab }
        })
      },
      get () {
        return this.$route.query.vtab
      }
    },
    schemeID () {
      return this.$store.state.settings.lang
    }
  },

  methods: {
    init () {
      fetch(this.$VARNAM_API_URL + '/schemes/' + this.schemeID + '/definitions')
        .then(r => r.json())
        .then(r => {
          this.details = r.Details

          this.definitions = r.Definitions.map(def => {
            def.Exact = def.Exact && def.Exact.join(', ')
            def.Possibility = def.Possibility && def.Possibility.join(', ')
            return def
          })

          // Make groups closed by default
          this.$nextTick(() => {
            this.toggleAllGroups()
          })
        })
    },

    toggleAllGroups () {
      let close = false
      if (this.groupsOpened > 0) close = true // Close all
      Object.keys(this.$refs).forEach(k => {
        if (!this.$refs[k]) return
        const el = this.$refs[k].$el
        if (close && el.hasAttribute('opened')) {
          el.click()
        }
        if (!close && !el.hasAttribute('opened')) {
          el.click()
        }
      })
      this.updateGroupsOpen()
    },

    updateGroupsOpen () {
      this.$nextTick(() => {
        let n = 0
        Object.keys(this.$refs).forEach(k => {
          if (!this.$refs[k]) return
          const el = this.$refs[k].$el
          if (el.hasAttribute('opened')) {
            n++
          }
        })
        this.groupsOpened = n
      })
    }
  },

  mounted () {
    this.init()

    this.$store.subscribe(mutation => {
      if (mutation.type === 'updateSettings') {
        this.init()
      }
    })
  }
}
</script>
