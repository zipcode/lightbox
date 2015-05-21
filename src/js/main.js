'use strict';

window.log = function () {
  console.log.apply(console, arguments);
}

function main () {
  Lightbox.attach();
}

document.addEventListener("DOMContentLoaded", main);
