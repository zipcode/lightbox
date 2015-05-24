'use strict';

window.Lightbox = (function () {
  var prefix = "zip-";

  function View(element) {
    if (!(this instanceof View)) {
      throw new Error("Called a View() or subclass without new");
    }
    var self = this;
    this.element = element;
    element.view = this;

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
        this.onAttributeChange(mutation.attributeName, this.element.attributes[mutation.attributeName]);
      }
    },
    onAttributeChange: function(name, newVal) {},
  }

  // Return a lightbox for a node, if there is one
  // This abstraction exits so we don't have to rely
  // on putting instances on element nodes later.
  View.for = function (element) {
    return element.view;
  }

  function Lightbox(element) {
    View.call(this, element);
  }
  Lightbox.prototype = Object.create(View.prototype);

  // LoadingView stuff
  function LoadingView(element) {
    View.call(this, element)
  }
  LoadingView.prototype = Object.create(View.prototype);

  return Lightbox;
})();
