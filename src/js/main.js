'use strict';

window.log = function () {
  console.log.apply(console, arguments);
}

function main () {
  Lightbox.attach(document.body);
}

document.addEventListener("DOMContentLoaded", main);
