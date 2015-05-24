'use strict';

window.log = function () {
  console.log.apply(console, arguments);
}

function main () {
  var elem = document.querySelector('[zip-lightbox]');
  new Lightbox(elem);
}

document.addEventListener("DOMContentLoaded", main);
