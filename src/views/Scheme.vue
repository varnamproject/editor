<template>
  <v-container fluid>
    <v-layout class="d-flex justify-center">
      <v-flex xs11 xl6>
        <v-tabs v-model="tab" :grow="true" :show-arrows="true">
          <v-tabs-slider></v-tabs-slider>
          <v-tab href="#scheme">
            <v-icon>lead-pencil</v-icon>
            Scheme
          </v-tab>
          <v-tab href="#reverse">
            <v-icon>lead-pencil</v-icon>
            How To Write A Word
          </v-tab>
          <v-tab href="#credits">
            <v-icon>lead-pencil</v-icon>
            Credits
          </v-tab>
          <v-tab-item value="scheme">
            <v-card :loading="schemeCardLoading">
              <v-card-text>
                <p>This page shows which key is mapped to each letter.<br/>
                <b>"Primary"</b> is the <b>highest</b> priority primary key combination for a letter.<br/>
                <b>"Secondary"</b> is only a secondary key for a letter.</p>
              </v-card-text>
              <v-card-title>
                <p v-if="tableTitle" class="text-h4 text--primary">
                  <v-btn to="/scheme" color="primary" class="ma-2" depressed>
                    <v-icon :left="icon">mdi-arrow-left</v-icon>
                    <span v-show="iconText">Back</span>
                  </v-btn>
                  {{tableTitle}}
                </p>
                <v-btn v-else color="primary" @click="toggleAllGroups">{{groupsOpened > 0 ? "Close All" : "Open All"}}</v-btn>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-card-title>
              <v-data-table :headers="headers" :items="definitions" :items-per-page="-1" group-by="Category" :search="search" :custom-sort="schemeTableSortFunc" dense>
                <template v-slot:group.header="{ group, headers, toggle, isOpen }">
                  <td :colspan="headers.length">
                    <v-btn @click="() => {toggle();updateGroupsOpen();}" x-small icon :ref="group" v-bind:opened="isOpen">
                      <v-icon v-if="isOpen">mdi-minus</v-icon>
                      <v-icon v-else>mdi-plus</v-icon>
                    </v-btn>
                    <span class="mx-5 text-subtitle-1 font-weight-bold">{{ group }}</span>
                  </td>
                </template>
                <template v-slot:item.Letter="{ item }">
                  <router-link :to="'/scheme/' + item.Letter" class="text-h6">{{item.Letter}}</router-link>
                </template>
              </v-data-table>
            </v-card>
          </v-tab-item>
          <v-tab-item value="reverse">
            <v-card>
              <v-card-text>
                <v-form @submit="reverseTransliterate" class="d-flex flex-row flex-grow-1">
                  <v-text-field
                    v-model="reverseTransliterateInput"
                    append-icon="mdi-magnify"
                    v-bind:label="'Type ' + schemeDisplayName + ' words here...'"
                    single-line
                    hide-details
                    class="flex-grow-1"
                  ></v-text-field>
                  <v-btn class="flex-shrink-0 ml-4 align-self-center" color="primary" type="submit">Find</v-btn>
                </v-form>
                <p class="mt-2">Find different ways to write a {{schemeDisplayName}} word. This is reverse transliteration.</p>
                <v-list-item v-for="(result, index) in reverseTransliterationResult" :key="index">
                  <v-list-item-content>
                    <v-list-item-title>{{index + 1}}. {{result}}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-card-text>
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
      tableTitle: '',
      details: {},

      schemeCardLoading: false,
      definitions: [],

      headers: [
        {
          text: 'Letter',
          align: 'start',
          value: 'Letter',
          groupable: true,
          width: '15%'
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
      reverseTransliterateInput: '',
      reverseTransliterationResult: [],

      groupsOpened: 1 // Since default is all opened, we do a close in init()
    }
  },

  computed: {
    tab: {
      set (tab) {
        if (tab === 'scheme') {
          this.$router.replace({
            query: {}
          })
        } else {
          this.$router.replace({
            query: { ...this.$route.query, tab }
          })
        }
      },
      get () {
        if (this.$route.query.tab === '') return 'scheme'
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
    },
    schemeDisplayName () {
      const langInfo = this.$store.state.langs.find(item => {
        return item.Identifier === this.$store.state.settings.lang
      })

      if (langInfo) {
        return langInfo.DisplayName
      } else {
        return ''
      }
    }
  },

  methods: {
    init () {
      this.schemeCardLoading = true

      let url = this.$VARNAM_API_URL + '/schemes/' + this.schemeID + '/definitions'
      if (this.$route.params.letter) {
        url += '/' + this.$route.params.letter
        this.tableTitle = this.$route.params.letter
      } else {
        this.tableTitle = ''
      }
      fetch(url)
        .then(r => r.json())
        .then(r => {
          this.details = r.Details

          this.definitions = r.Definitions.map(def => {
            def.Exact = def.Exact && def.Exact.join(', ')
            def.Possibility = def.Possibility && def.Possibility.join(', ')
            return def
          })

          this.schemeCardLoading = false

          // make groups closed by default
          this.$nextTick(() => {
            this.updateGroupsOpen()
            if (this.groupsOpened > 0) {
              this.toggleAllGroups() // Close
            }
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
    },

    reverseTransliterate (e) {
      e.preventDefault()
      const input = encodeURIComponent(this.reverseTransliterateInput)
      fetch(this.$VARNAM_API_URL + '/rtl/' + this.schemeID + '/' + input)
        .then(r => r.json())
        .then(r => {
          this.reverseTransliterationResult = r.result
        })
    },

    schemeTableSortFunc (items, sortBy, sortDesc) {
      return items.sort((a, b) => {
        a = a[sortBy[0]]
        b = b[sortBy[0]]

        const aEnglish = /^[A-Za-z0-9]*$/.test(a.substr(0, 1))
        const bEnglish = /^[A-Za-z0-9]*$/.test(b.substr(0, 1))

        if (aEnglish && bEnglish) {
          return a > b
        } else if (aEnglish && !bEnglish) {
          return 1
        } else if (!aEnglish && bEnglish) {
          return -1
        } else {
          return a.localeCompare(b)
        }
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
  },

  watch: {
    '$route' (to, from) {
      // react to route changes
      this.init()
    }
  }
}
</script>
