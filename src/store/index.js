import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentWord: 0, // Word ID

    setupDialog: false,

    // TODO replace lang with scheme ID in all places
    // Detailed info of all the schemes
    // https://api.varnamproject.com/languages
    langs: [],

    // set upstream varnamd URL
    // https://api.varnamproject.com/
    upstreamURL: '',

    // Suggestions to display
    suggestionsDisplay: [],

    /**
     * {
     *   wordid: [
     *     0: englishword,
     *     ...suggestions
     *   ]
     * }
     */
    suggestions: {},

    /**
     * {
     *   transliterated_word: [suggestions]
     * }
     */
    alternateWords: {},

    // Editor settings
    settings: {
      lang: 'ml',
      fontSize: 14,
      suggestionsPanelPosition: 'left'
    },

    // IDB Words. Will change as lang change
    idbWords: {}
  },
  mutations: {
    initSettings (state) {
      let settings = window.localStorage.getItem('varnam-settings')
      if (settings) {
        settings = JSON.parse(settings)
        state.settings = Object.assign({}, state.settings, settings)
      }
    },

    updateSettings (state, payload) {
      Vue.set(state, 'settings', {
        ...state.settings,
        ...payload
      })

      window.localStorage.setItem('varnam-settings', JSON.stringify(state.settings))
    },

    setCurrentWord (state, payload) {
      state.currentWord = payload
    },

    setSuggestions (state, payload) {
      Vue.set(state.suggestions, payload.id, payload.suggestions)
    },

    clearSuggestions (state, wordID) {
      Vue.delete(state.suggestions, wordID)
    },

    displaySuggestions (state, suggestions) {
      state.suggestionsDisplay = suggestions
    },

    hideSuggestions (state) {
      state.suggestionsDisplay = []
    },

    setLangs (state, langs) {
      // Sort by identifier
      langs.sort((a, b) => a.Identifier.localeCompare(b.Identifier))
      state.langs = langs

      if (langs.length === 0) {
        state.setupDialog = true
      }
    },

    setUpstream (state, url) {
      state.upstreamURL = url
    },

    setIDBWords (state, wordsArray) {
      // TODO: storing all words in an object is probably a bad idea
      // will work good for small amount of words, so it's alright
      const words = {}
      wordsArray.forEach(item => {
        words[item.pattern] = item.word
      })
      state.idbWords = words
    },

    hideSetupDialog (state) {
      state.setupDialog = false
    },

    // Event Bus
    // Dummy mutations
    // For events across components
    requestSend () {},
    chooseSuggestion () {}
  },
  actions: {
  },
  modules: {
  }
})
