export default class Frame {

  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  static zero() {
    return new Frame(0, 0, 0, 0);
  }

  clone() {
    return new Frame(this.x, this.y, this.width, this.height);
  }

  intersection(frame) {
    let x = Math.max(this.x, frame.x);
    let width = Math.min(this.x + this.width, frame.x + frame.width);
    let y = Math.max(this.y, frame.y);
    let height = Math.min(this.y + this.height, frame.y + frame.height);
    if (width >= x && height >= y) {
      return make(x, y, width - x, height - y);
    }
    return null;
  }

  union(frame) {
    let x1 = Math.min(this.x, frame.x);
    let x2 = Math.max(this.x + this.width, frame.x + frame.width);
    let y1 = Math.min(this.y, frame.y);
    let y2 = Math.max(this.y + this.height, frame.y + frame.height);
    return new Frame(x1, y1, x2 - x1, y2 - y1);
  }

  intersects(frame) {
    return !(frame.x > this.x + this.width ||
           frame.x + frame.width < this.x ||
           frame.y > this.y + this.height ||
           frame.y + frame.height < this.y);
  }
}