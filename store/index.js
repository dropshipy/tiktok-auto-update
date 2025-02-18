export const state = () => ({
  language: "",
});

export const getters = {
  getLanguage(state) {
    return state.language;
  },
};

export const mutations = {
  SET_LANGUAGE(state, lang) {
    state.language = lang;
  },
};
