/**
 * Simple reactive state store for AgriNovaX
 */
export const state = {
  _data: {
    inputData: null,
    results: null,
    weather: null,
    loading: false,
    language: 'en',
  },
  _listeners: [],

  get(key) {
    return this._data[key];
  },

  set(key, value) {
    this._data[key] = value;
    this._notify(key, value);
  },

  _notify(key, value) {
    this._listeners.forEach(fn => fn(key, value));
  },

  subscribe(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  }
};
