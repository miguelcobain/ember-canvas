import Ember from 'ember';
import BaseLayer from './base-layer';
import { defaultFontFace } from 'ember-canvas/utils/font-face';
import measureText from 'ember-canvas/utils/measure-text';
const { Component } = Ember;

export default Component.extend({
  customDraw(ctx) {
    let fontFace = this.get('fontFace') || defaultFontFace;

    // Don't draw text until loaded
    if (!fontFace.isLoaded()) {
      return;
    }

    let text = this.get('text');
    let x = this.frame.x;
    let y = this.frame.y;
    let width = this.frame.width;
    let height = this.frame.height;

    let currX = x;
    let currY = y;
    let currText;

    let fontSize = this.get('fontSize') || 16;
    let lineHeight = this.get('lineHeight') || 18;
    let textAlign = this.get('textAlign') || 'left';
    let backgroundColor = this.get('backgroundColor') || 'transparent';
    let color = this.get('color') || '#000';

    let textMetrics = measureText(
      text,
      width,
      fontFace,
      options.fontSize,
      options.lineHeight
    );

    ctx.save();

    // Draw the background
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.fillStyle = color;
    ctx.font = fontFace.attributes.style + ' ' + fontFace.attributes.weight + ' ' + options.fontSize + 'px ' + fontFace.family;

    textMetrics.lines.forEach((line, index) => {
      currText = line.text;
      currY = (index === 0) ? y + fontSize :
        (y + fontSize + lineHeight * index);

      // Account for text-align: left|right|center
      switch (textAlign) {
        case 'center':
          currX = x + (width / 2) - (line.width / 2);
          break;
        case 'right':
          currX = x + width - line.width;
          break;
        default:
          currX = x;
      }

      if ((index < textMetrics.lines.length - 1) &&
        ((fontSize + lineHeight * (index + 1)) > height)) {
        currText = currText.replace(/\,?\s?\w+$/, '…');
      }

      if (currY <= (height + y)) {
        ctx.fillText(currText, currX, currY);
      }
    });

    ctx.restore();
  }
});
