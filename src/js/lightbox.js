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
      "success": DisplayImagesView,
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
    var success = function (data) {
      window.clearTimeout(timeout);
      self.setState("success", data);
    };
    var failure = function (reason) {
      window.clearTimeout(timeout);
      self.setState("failure", "Failure: " + reason);
    };

    // PROVIDER SELECTION GOES HERE
    new ColorProvider(success, failure);
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

  // DisplayImagesView stuff
  function DisplayImagesView(element, provider) {
    View.call(this, element);
    this.provider = provider;
    this.element.setAttribute("class", "zip-lightbox-display");
    this.showArrows();
    this.display();
  }
  DisplayImagesView.prototype = Object.create(View.prototype);
  DisplayImagesView.prototype.display = function () {
    var image = this.provider.image();
    if (this.image) {
      this.image.element.remove();
    }
    if (image) {
      this.image = image;
      this.element.appendChild(image.element);
    }
  }
  DisplayImagesView.prototype.next = function () {
    this.provider.next();
    return this.display();
  }
  DisplayImagesView.prototype.last = function () {
    this.provider.last();
    return this.display();
  }
  DisplayImagesView.prototype.showArrows = function () {
    var self = this;
    function makeArrow (directionMethod) {
      var box = document.createElement("div");
      var arrow = document.createElement("span");
      box.appendChild(arrow);
      box.addEventListener("click", function () {
        self[directionMethod].call(self);
      });
      box.setAttribute("class", "arrow " + directionMethod);
      return box;
    }
    this.element.appendChild(makeArrow("last"));
    this.element.appendChild(makeArrow("next"));
  }

  // Providers and ImageViews
  // Providers are a source of data.
  function ImageView(element) {
    View.call(this, element);
  }
  ImageView.prototype = Object.create(View.prototype);

  function ColorView(element, color) {
    ImageView.call(this, element);
    this.element.style.backgroundColor = color;
    this.element.setAttribute("caption", color);
  }
  ColorView.prototype = Object.create(ImageView.prototype);

  function Provider() {
    if (!(this instanceof Provider)) {
      throw new Error("Attempted to call Provider() without 'new'");
    }
    this.index = 0;
  }
  Provider.prototype = {};
  Provider.prototype.image = function () {};
  Provider.prototype.hasNext = function () {
    return this.index < (this.length - 1);
  }
  Provider.prototype.hasLast = function () {
    return this.index > 0;
  }
  Provider.prototype.next = function () {
    this.index = Math.min(this.length, this.index + 1);
    return this;
  }
  Provider.prototype.last = function () {
    this.index = Math.max(0, this.index - 1);
    return this;
  }

  function ColorProvider(success, failure) {
    Provider.call(this);

    this.index = 0;
    this.colors = [];
    for (var i = 0; i < 10; i++) {
      var r = Math.floor(Math.random() * 255);
      var g = Math.floor(Math.random() * 255);
      var b = Math.floor(Math.random() * 255);
      var color = "rgb(" + r + ", " + g + ", " + b + ")";
      this.colors[i] = color;
    }

    success(this);
  }
  ColorProvider.prototype = Object.create(Provider.prototype);
  Object.defineProperty(ColorProvider.prototype, "color", {
    get: function () { return this.colors[this.index]; }
  });
  Object.defineProperty(ColorProvider.prototype, "length", {
    get: function () { return this.colors.length; }
  });
  ColorProvider.prototype.image = function () {
    return new ColorView(undefined, this.color);
  }

  return Lightbox;
})();
