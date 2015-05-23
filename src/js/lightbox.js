'use strict';

window.Lightbox = (function () {
  function View(element) {
    if (!(this instanceof View)) {
      throw new Error("Called a View() or subclass without new");
    }
    var self = this;
    this.element = element;

    // Fire an event every time a mutation occurs
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        self.mutate(mutation);
      }
    });
    observer.observe(element, {attributes: true});
  }

  View.prototype = {
    mutate: function (mutation) {
      if (mutation.type == "attributes") {
        self.onAttributeChange(mutation.attributeName, self.attributes[mutation.attributeName]);
      }
    },
    onAttributeChange: function(name, newVal) {
      console.log(name, newVal);
    }
  }

  function Lightbox(element) {
    View.call(this, element);

    // Register lightbox with element
    // Alter Lightbox.for() if you change this
    element.lightbox = this;

    // Fire a source change to start the state machine
    this.onSrcChange();
  }
  Lightbox.prototype = Object.create(View.prototype);

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

  Lightbox.prototype.onAttributeChange = function (name, newVal) {
    if (name == "src") {
      return this.onSrcChange();
    }
  }

  Lightbox.prototype.onSrcChange = function () {
    var src = this.element.getAttribute("src")
    log("onSrcChange", src);
  }

  Lightbox.prototype.setSrc = function (src) {
    this.element.setAttribute("src", src);
  }

  // LoadingView stuff
  function LoadingView() {}
  LoadingView.prototype = Object.create({});



  return Lightbox;
})();
