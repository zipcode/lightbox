'use strict';

window.Lightbox = (function () {
  function Lightbox(element) {
    if (!(this instanceof Lightbox)) {
      throw new Error("Called Lightbox() without 'new'");
    }
    this.element = element;
    element.lightbox = this;
  }
  Lightbox.prototype = Object.create({});

  Lightbox.attach = function (node) {
    var targets = node.querySelectorAll('[zip-lightbox]');
    for (var i = 0; i < targets.length; i++) {
      var target = targets[i];
      if (target.lightbox) continue;
      new Lightbox(target);
    }
  }

  return Lightbox;
})();
