import Ember from 'ember';
const { RSVP } = Ember;

let _useNativeImpl = (window && typeof window.FontFace !== 'undefined');
let _loadedFonts = {};
let _failedFonts = {};

const kFontLoadTimeout = 3000;

export default class FontFace {
  constructor(family, url, attributes = {}) {
    attributes.style = attributes.style || 'normal';
    attributes.weight = attributes.weight || 400;
    let fontId = getCacheKey(family, url, attributes);

    this.id = fontId;
    this.family = family;
    this.url = url;
    this.attributes = attributes;
  }

  isLoaded() {
    // For remote URLs, check the cache. System fonts (sans url) assume loaded.
    return _loadedFonts[this.id] !== undefined || !this.url;
  }

  loadFont() {
    // See if we've previously loaded it.
    if (_loadedFonts[this.id]) {
      return RSVP.resolve(null);
    }

    // See if we've previously failed to load it.
    if (_failedFonts[this.id]) {
      return RSVP.resolve(_failedFonts[this.id]);
    }

    // System font: assume it's installed.
    if (!this.url) {
      return RSVP.resolve(null);
    }

    // Use font loader API
    return new Promise((resolve, reject) => {
      let theFontFace = new window.FontFace(this.family, 'url(' + this.url + ')', this.attributes);
      theFontFace.load().then(function () {
        _loadedFonts[this.id] = true;
        resolve(null);
      }, function (err) {
        _failedFonts[this.id] = err;
        reject(err);
      });
    });
  }
}

/**
 * Helper for retrieving the default family by weight.
 *
 * @param {Number} fontWeight
 * @return {FontFace}
 */
export function defaultFontFace(fontWeight) {
  return new FontFace('sans-serif', null, { weight: fontWeight });
};

/**
 * @internal
 */
function getCacheKey(family, url, attributes) {
  return family + url + Object.keys(attributes).sort().map((key) => attributes[key]);
}