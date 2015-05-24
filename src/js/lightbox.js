'use strict';

window.Lightbox = (function () {
  var prefix = "zip-";

  /*
  A very thin View class.  The View wraps an element, keeps up the connection
  between that element and the custom class around it, and also will fire
  an event or two if the element's attributes are changed.
  */
  function View(element) {
    if (!(this instanceof View)) {
      throw new Error("Called a View() or subclass without new");
    }

    if (element === undefined) {
      // Create an element
      element = document.createElement("div");
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
        this.onAttributeChange(mutation.attributeName, this.element.attributes[mutation.attributeName].value);
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
    this.loadSrc(this.element.attributes["src"].value);
  }
  Lightbox.prototype = Object.create(View.prototype);

  Lightbox.prototype.onAttributeChange = function(name, newVal) {
    if (name === "src") {
      this.loadSrc(newVal);
    }
  };

  // Associate each state with a view and display that view on state change
  Lightbox.prototype.setState = function (state, data) {
    this.state = state;
    var view = ({
      "failure": FailureView,
      "loading": LoadingView,
    })[state];
    if (this.view !== undefined) {
      this.view.element.remove();
    }
    if (view instanceof Function) {
      this.view = new view(undefined, data);
      this.element.appendChild(this.view.element);
    } else {
      console.log("No view for ", state);
    }
  };

  Lightbox.prototype.loadSrc = function (src) {
    var self = this;
    this.setState("loading");
    var timeout = window.setTimeout(function () {
      self.setState("failure", "Timeout");
    }, 10000);
    var success = function () {
      window.cancelTimeout(timeout);
      window.setState("success");
    };
    var failure = function (reason) {
      window.cancelTimeout(timeout);
      self.setState("failure", "Failure: " + reason);
    };
  };

  // LoadingView stuff
  function LoadingView(element) {
    View.call(this, element);

    for (var i = 0; i < 3; i++) {
      var spot = document.createElement("span");
      spot.innerHTML = "&#9679;";
      this.element.appendChild(spot);
    }

    this.element.setAttribute("class", "zip-lightbox-loading");
  }
  LoadingView.prototype = Object.create(View.prototype);

  // FailureView stuff
  function FailureView(element, reason) {
    View.call(this, element);

    this.element.textContent = reason;
    this.element.setAttribute("class", "zip-lightbox-failure");
  }
  FailureView.prototype = Object.create(View.prototype);

  return Lightbox;
})();
