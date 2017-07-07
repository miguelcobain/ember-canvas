import Ember from 'ember';
import layout from '../templates/components/canvas-surface';
import BaseLayer from './base-layer';
const { computed, String: { htmlSafe } } = Ember;

export default BaseLayer.extend({
  layout,
  tagName: 'canvas',
  attributeBindings: ['style'],

  scale: 1,

  style: computed('width', 'height', function() {
    return htmlSafe(`width: ${this.get('width')};height: ${this.get('height')};`);
  }),

  didInsertElement() {
    this._super(...arguments);
    this.getContext().scale(this.get('scale'), this.get('scale'));

    this.batchedTick();
  },

  // Drawing

  getContext() {
    return this.element.getContext('2d');
  },

  batchedTick() {
    if (this._frameReady === false) {
      this._pendingTick = true;
      return;
    }
    this.tick();
  },

  tick() {
    // Block updates until next animation frame.
    this._frameReady = false;
    this.clear();
    this.draw();
    requestAnimationFrame(this.afterTick);
  },

  afterTick() {
    // Execute pending draw that may have been scheduled during previous frame
    this._frameReady = true;
    if (this._pendingTick) {
      this._pendingTick = false;
      this.batchedTick();
    }
  },

  clear() {
    this.getContext().clearRect(0, 0, this.get('width'), this.get('height'));
  }
});
