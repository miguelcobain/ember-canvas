import Ember from 'ember';
import Frame from 'ember-canvas/utils/frame';
import { ParentMixin } from 'ember-composability-tools';
const { Component, computed, tryInvoke } = Ember;

export default Component.extend({
  tagName: '',

  childrenSorting: ['zIndex'],
  sortedChildren: computed.sort('childComponents', 'childComponentsSorting'),

  didInsertElement() {
    this._super(...arguments);
    this.frame = new Frame(style.left || 0, style.top || 0, style.width || 0, style.height || 0);
  },

  draw() {

    // Performance: avoid drawing hidden layers.
    if (typeof this.get('alpha') === 'number' && this.get('alpha') <= 0) {
      return;
    }

    let ctx = this.getContext();

    // Establish drawing context for certain properties:
    // - alpha
    // - translate
    let saveContext = (this.get('alpha') !== null && this.get('alpha') < 1) ||
                      (this.get('translateX') || this.get('translateY'));

    if (saveContext) {
      ctx.save();

      // Alpha:
      if (this.get('alpha') !== null && this.get('alpha') < 1) {
        ctx.globalAlpha = this.get('alpha');
      }

      // Translation:
      if (this.get('translateX') || this.get('translateY')) {
        ctx.translate(this.get('translateX') || 0, this.get('translateY') || 0);
      }
    }

    ctx.save();
    this.drawBorderRadius(ctx);
    this.drawShadow(ctx);
    this.drawBackgroundColor(ctx);

    // call layer's custom draw func
    tryInvoke(this, 'customDraw', [ctx]);
    ctx.restore();

    // Draw child layers, sorted by their z-index.
    this.get('sortedChildren').invoke('draw');

    // Pop the context state if we established a new drawing context.
    if (saveContext) {
      ctx.restore();
    }
  },

  drawBorderRadius(ctx) {
    let frame = this.frame;

    if (this.get('borderRadius')) {
      ctx.beginPath();
      ctx.moveTo(frame.x + this.get('borderRadius'), frame.y);
      ctx.arcTo(frame.x + frame.width, frame.y, frame.x + frame.width, frame.y + frame.height, this.get('borderRadius'));
      ctx.arcTo(frame.x + frame.width, frame.y + frame.height, frame.x, frame.y + frame.height, this.get('borderRadius'));
      ctx.arcTo(frame.x, frame.y + frame.height, frame.x, frame.y, this.get('borderRadius'));
      ctx.arcTo(frame.x, frame.y, frame.x + frame.width, frame.y, this.get('borderRadius'));
      ctx.closePath();


      // Border with border radius:
      if (this.get('borderColor')) {
        ctx.lineWidth = this.get('borderWidth') || 1;
        ctx.strokeStyle = this.get('borderColor');
        ctx.stroke();
      }
    }

    // Border color (no border radius):
    if (this.get('borderColor') && !this.get('borderRadius')) {
      ctx.lineWidth = this.get('borderWidth') || 1;
      ctx.strokeStyle = this.get('borderColor');
      ctx.strokeRect(frame.x, frame.y, frame.width, frame.height);
    }
  },

  drawShadow(ctx) {
    ctx.shadowBlur = this.get('shadowBlur');
    ctx.shadowColor = this.get('shadowColor');
    ctx.shadowOffsetX = this.get('shadowOffsetX');
    ctx.shadowOffsetY = this.get('shadowOffsetY');
  },

  drawBackgroundColor(ctx) {
    if (this.get('backgroundColor')) {
      let frame = this.frame;

      ctx.fillStyle = this.get('backgroundColor');
      if (this.get('borderRadius')) {
        // Fill the current path when there is a borderRadius set.
        ctx.fill();
      } else {
        ctx.fillRect(frame.x, frame.y, frame.width, frame.height);
      }
    }
  },

  getContext() {
    return this.get('parentComponent').getContext();
  }
});
