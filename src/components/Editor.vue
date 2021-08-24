<template>
  <div class="textarea">
    <v-textarea
      outlined
      name="translate"
      label="Type here..."
      rows="20"
      v-model="inputText"
      ref="editor"
      :autofocus="true"
      :style="`font-size: ${$store.state.settings.fontSize}px`"
    ></v-textarea>
    <v-dialog
      v-model="setupDialog"
      persistent
      max-width="500"
    >
      <v-card>
        <v-card-title class="headline">
          No Varnam Languages Found
        </v-card-title>
        <v-card-text>Varnam couldn't find any languages set up. This looks like a first install. Set up languages to use Varnam.</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            to="/settings"
            @click="setupDialog = false"
          >
            Set Up Languages
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Tribute from 'webime'
import 'webime/tribute.css'

// const minWordSize = 1
// const cycleOnTab = true
// const KEY = {
//   UNKNOWN: 0,
//   SHIFT: 16,
//   CTRL: 17,
//   ALT: 18,
//   LEFT: 37,
//   UP: 38,
//   RIGHT: 39,
//   DOWN: 40,
//   DEL: 46,
//   TAB: 9,
//   RETURN: 13,
//   ESC: 27,
//   COMMA: 188,
//   PAGEUP: 33,
//   PAGEDOWN: 34,
//   BACKSPACE: 8,
//   SPACE: 32
// }

let input

// const transliterateTimeout = []
const fetchController = []

// Thanks vsync
// https://stackoverflow.com/a/13335359/1372424
// function hasEnglishChar (s) {
//   let i, charCode
//   for (i = s.length; i--;) {
//     charCode = s.charCodeAt(i)
//     // Character code from A to z
//     if (charCode >= 65 && charCode <= 122) {
//       return true
//     }
//   }
//   return false
// }

export default {
  name: 'Editor',

  data () {
    return {
      inputText: '',
      alternateWords: []
    }
  },

  computed: {
    setupDialog: {
      get () {
        return this.$store.state.setupDialog
      },

      set () {
        this.$store.commit('hideSetupDialog')
      }
    },

    lang: function () {
      return this.$store.state.settings.lang
    },

    suggestions: function () {
      return this.$store.state.suggestions
    }
  },

  methods: {
    init () {
      const tribute = new Tribute({
        autocompleteMode: true,
        allowSpaces: true,

        values: (text, cb) => {
          this.transliterate(text)
            .then(sugs => {
              if (!sugs) return
              const result = []
              for (let i = 0; i < sugs.length; i++) {
                const retval = {
                  key: text,
                  value: sugs[i].trim()
                }
                result.push(retval)
              }
              cb(result)
            })
        },

        menuItemTemplate: item => {
          return '<span style="font-size: ' + this.$store.state.settings.fontSize + 'px">' + item.original.value + '</span>'
        }
      })

      input = this.$refs.editor.$el.getElementsByTagName('textarea')[0]

      tribute.attach(input)

      // For online editor
      if (!this.$VARNAM_OFFLINE) {
        this.$VARNAM_IDB.fetchWords()

        this.$store.subscribe(mutation => {
          if (mutation.type === 'updateSettings') {
            this.$VARNAM_IDB.fetchWords()
          }
        })
      }
    },

    transliterate (word) {
      return new Promise((resolve, reject) => {
        let suggestions = []
        word = encodeURIComponent(word)

        if (!this.$VARNAM_OFFLINE && this.$store.state.idbWords[word]) {
          // First, check IndexedDB
          suggestions = this.$store.state.idbWords[word]
          resolve(suggestions)
        } else {
          fetchController[word] = new AbortController()

          // For event trigger
          this.$store.commit('requestSend')

          fetch(
            this.$VARNAM_API_URL + `/tl/${this.lang}/${word}`,
            {
              signal: fetchController[word].signal
            }
          )
            .then(response => response.json())
            .then(data => {
              suggestions = data.result
              resolve(suggestions)

              delete fetchController[word]
            })
        }
      })
    }
  },
  mounted () {
    this.init()
  }
}
</script>

<style>
</style>
