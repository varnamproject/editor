<template>
  <v-container fluid>
    <v-layout class="d-flex justify-center">
      <v-flex xs11 xl6>
        <v-tabs v-model="tab" :grow="true" :show-arrows="true">
          <v-tabs-slider></v-tabs-slider>
          <v-tab href="#editor">
            <v-icon>lead-pencil</v-icon>
            Editor
          </v-tab>
          <v-tab href="#words">
            <v-icon>lead-pencil</v-icon>
            Words
          </v-tab>
          <v-tab-item value="editor">
            <EditorSettings />
            <LanguageDownload v-if="$VARNAM_OFFLINE" />
          </v-tab-item>
          <v-tab-item value="words">
            <div v-if="$VARNAM_OFFLINE">
              <AddWordsOffline/>
            </div>
            <div v-else>
              <v-tabs v-model="vtab" :vertical="true">
                <v-tab href="#offline">Offline</v-tab>
                <v-tab href="#online">Online</v-tab>
                <v-tab-item value="offline">
                  <v-card flat tile>
                    <v-card-text>
                      <AddWordsOffline/>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
                <v-tab-item value="online">
                  <v-card flat tile>
                    <v-card-text>
                      <AddWordsOnline/>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </div>
          </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout><br/>
    <v-divider></v-divider>
    <Footer />
  </v-container>
</template>

<script>
import AddWordsOnline from '@/components/AddWordsOnline.vue'
import AddWordsOffline from '@/components/AddWordsOffline.vue'
import EditorSettings from '@/components/EditorSettings.vue'
import LanguageDownload from '@/components/LanguageDownload.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'Settings',

  components: {
    AddWordsOnline,
    AddWordsOffline,
    EditorSettings,
    LanguageDownload,
    Footer
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
    }
  }
}
</script>
