'use strict';

window.Lightbox = (function () {
  function Lightbox(element) {
    if (!(this instanceof Lightbox)) {
      throw new Error("Called Lightbox() without 'new'");
    }
    var self = this;
    this.element = element;

    // Fire a local event if the src is changed
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (mutation.type !== "attributes") continue;
        if (mutation.attributeName !== "src") continue;
        self.onSrcChange();
      }
    });
    observer.observe(element, {
      attributes: true,
      attributeFilter: ['src']
    });

    // Register lightbox with element
    // Alter Lightbox.for() if you change this
    element.lightbox = this;

    // Fire a source change to start the state machine
    this.onSrcChange();
  }
  Lightbox.prototype = Object.create({});

  // Find any nodes with a zip-lightbox attribute
  // and attach a Lightbox if it doesn't already
  // have one
  Lightbox.attach = function (node) {
    node = node || document.body;
    var targets = node.querySelectorAll('[zip-lightbox]');
    for (var i = 0; i < targets.length; i++) {
      var target = targets[i];
      if (Lightbox.for(target)) continue;
      new Lightbox(target);
    }
  }

  // Return a lightbox for a node, if there is one
  // This abstraction exits so we don't have to rely
  // on putting instances on element nodes later.
  Lightbox.for = function (node) {
    return node.lightbox;
  }

  Lightbox.prototype.onSrcChange = function () {
    var src = this.element.getAttribute("src")
    log("onSrcChange", src);
  }

  Lightbox.prototype.setSrc = function (src) {
    this.element.setAttribute("src", src);
  }

  return Lightbox;
})();
