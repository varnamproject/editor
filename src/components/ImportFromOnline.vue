<template>
  <div>
    <v-data-table
      :headers="headers"
      :items.sync="packs"
      item-key="identifier"
      show-expand
      show-select
      v-model="packsSelected"
      @item-selected="onPackSelect"
      @toggle-select-all="onPackSelectAll"
      class="packsTable"
    >
      <template v-slot:top>
        <v-row align="center" justify="end">
          <v-col l="10">
            Choose the language packs you need and click download
          </v-col>
          <v-col cols="2">
            <v-btn depressed color="primary" :disabled="downloadBtnDisabled" @click="download" title="Download & Import" aria-label="Download & Import">
              <v-icon left>mdi-arrow-down-box</v-icon>
              Download
            </v-btn>
          </v-col>
        </v-row>
      </template>
      <template v-slot:item.data-table-select="{ item, isSelected, select }">
        <v-icon
          v-if="item.installed"
          color="success"
          title="Installed"
          aria-label="Installed"
        >mdi-checkbox-blank-circle</v-icon>
        <div v-else>
          <v-simple-checkbox
            :ripple="false"
            :value="isSelected"
            @input="select($event)"
          ></v-simple-checkbox>
        </div>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td></td>
        <td :colspan="headers.length">
          <v-data-table
            :headers="pageHeaders"
            :items.sync="item.pages"
            :hide-default-header="true"
            :hide-default-footer="true"
            item-key="identifier"
            show-select
            v-model="packsPagesSelected"
            @item-selected="onPackPageSelect"
          >
            <template v-slot:item.data-table-select="{ item, isSelected, select }">
              <v-icon
                v-if="item.installed"
                color="success"
                title="Installed"
                aria-label="Installed"
              >mdi-checkbox-blank-circle</v-icon>
              <div v-else>
                <v-simple-checkbox
                  :ripple="false"
                  :value="isSelected"
                  @input="select($event)"
                ></v-simple-checkbox>
              </div>
            </template>
            <template v-slot:item.size="{ item }">
              {{ item.size | formatSize }}
            </template>
          </v-data-table>
        </td>
      </template>
    </v-data-table>
    <v-tabs
      v-if="Object.keys(log).length > 0"
      v-model="logTab"
    >
      <v-tab
        v-for="(logItem, identifier) in log"
        :key="identifier"
      >
        {{ identifier }}
      </v-tab>
      <v-tab-item
        v-for="(logItem, identifier) in log"
        :key="identifier"
      >
        <v-card flat :loading="logItem.loading">
          <v-card-subtitle>Import Status</v-card-subtitle>
          <v-card-text>
            <ul>
              <li v-for="(l, index) in logItem.log" :key="index">{{ l }}</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
export default {
  name: 'ImportFromOnline',

  data () {
    return {
      headers: [
        {
          text: 'Name',
          sortable: true,
          value: 'name'
        },
        {
          text: 'Description',
          sortable: false,
          value: 'description'
        }
      ],
      pageHeaders: [
        {
          text: 'Page',
          sortable: false,
          value: 'page'
        },
        {
          text: 'Description',
          sortable: false,
          value: 'description'
        },
        {
          text: 'Size',
          sortable: false,
          value: 'size' // in bytes
        }
      ],

      log: {},
      logLoading: false,
      logTab: 0,

      packsInstalled: [],
      packsFromUpstream: [],

      packsSelected: [],
      packsPagesSelected: []
    }
  },

  computed: {
    downloadBtnDisabled () {
      return this.packsPagesSelected.length === 0
    },

    upstreamURL () {
      return this.$store.state.upstreamURL
    },

    packs () {
      return this.packsFromUpstream.map((item, index) => {
        let installedPages = 0

        item.pages = item.pages.map(pageItem => {
          pageItem.packID = item.identifier

          pageItem.installed = this.packsInstalled.indexOf(pageItem.identifier) > -1
          if (pageItem.installed) installedPages++

          return pageItem
        })

        item.installed = installedPages === item.pages.length

        return item
      })
    }
  },

  methods: {
    init () {
      // This will give the installed packs
      window.fetch(window.$VARNAM_API_URL + '/packs/' + this.$store.state.settings.lang)
        .then(async response => {
          this.fetchPacksFromUpstream()

          const json = await response.json()

          if (response.status === 200) {
            // Get an array of installed packs' identifier
            this.packsInstalled = json.reduce((acc, item) => {
              return acc.concat(item.pages.reduce((acc2, item2) => {
                acc2.push(item2.identifier)
                return acc2
              }, []))
            }, [])
          } else if (response.status === 404) {
            this.packsInstalled = []
          } else {
            this.$toast('Local: ' + json.message, {
              color: 'error'
            })
          }
        })
    },

    fetchPacksFromUpstream () {
      // Fetch available packs from upstream
      window.fetch(this.upstreamURL + '/packs/' + this.$store.state.settings.lang)
        .then(response => response.json())
        .then(packs => {
          if (packs instanceof Array) {
            this.packsFromUpstream = packs
          } else {
            this.packsFromUpstream = []
          }
        })
    },

    onPackSelect (e) {
      if (e.value) {
        // checked
        this.packsPagesSelected = this.packsPagesSelected.concat(e.item.pages.filter(item => !item.installed))
      } else {
        const ids = []
        e.item.pages.forEach(item => ids.push(item.id))

        this.packsPagesSelected = this.packsPagesSelected.filter(item => ids.indexOf(item.id) === -1)
      }
    },

    onPackPageSelect (e) {
      const pack = this.packs.find(item => item.identifier === e.item.packID)
      const packsPagesSelected = this.packsPagesSelected.filter(item => item.packID === e.item.packID)

      const availablePages = pack.pages.filter(item => !item.installed)

      // +1 is for the current item selected
      if (availablePages.length === packsPagesSelected.length + (e.value ? 1 : -1)) {
        this.packsSelected.push(pack)
      } else {
        this.packsSelected = this.packsSelected.filter(item => item.identifier !== e.item.packID)
      }
    },

    onPackSelectAll (e) {
      if (e.value) {
        // Select all
        const allPacksPages = this.packs.reduce((combined, item) => combined.concat(item.pages.filter(item => !item.installed)), [])
        this.packsPagesSelected = allPacksPages
      } else {
        // Unselect all
        this.packsPagesSelected = []
      }
    },

    downloadPack (packPage) {
      const pid = packPage.identifier

      return new Promise((resolve, reject) => {
        this.$set(this.log, pid, {
          loading: true,
          log: ['Downloading pack...']
        })

        // This is a dekstop only endpoint. Not in varnamd
        window.fetch(this.$VARNAM_API_URL + '/packs/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lang: this.$store.state.settings.lang,
            pack: packPage.packID,
            page: pid
          })
        })
          .then(async response => {
            if (response.status === 200) {
              const reader = response.body.getReader()

              // "done" is a Boolean and value a "Uint8Array"
              const processResponse = ({ done, value }) => {
                const items = new TextDecoder('utf-8')
                  .decode(value)
                  .split('\n')
                  .filter(item => item.length !== 0)

                items.forEach(item => this.$set(this.log[pid].log, this.log[pid].log.length, item))

                if (done) {
                  this.$set(this.log[pid], 'loading', false)
                  this.$toast('Successfully imported pack', {
                    color: 'success'
                  })
                  this.packsInstalled.push(packPage.identifier)
                  resolve()
                } else {
                  // Read some more, and call this function again
                  return reader.read().then(processResponse)
                }
              }

              // read() returns a promise that resolves
              // when a value has been received
              reader.read().then(processResponse)
            } else {
              const json = await response.json()
              this.$toast(json.message, {
                color: 'error'
              })

              this.$set(this.log[pid], 'loading', false)
              this.$set(this.log[pid].log, this.log[pid].log.length, json.message)

              reject(new Error(json.message))
            }
          })
      })
    },

    download () {
      this.packsPagesSelected.forEach(async packPage => {
        await this.downloadPack(packPage)
      })
    }
  },

  created () {
    this.init()
    this.$store.subscribe(mutation => {
      if (mutation.type === 'setUpstream') {
        this.fetchPacksFromUpstream()
      }
    })
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

<style>
.v-data-table.packsTable .v-data-table__expanded__content {
  box-shadow: none;
}
</style>
