var gulp = require('gulp');

var gls = require('gulp-live-server');
var port = process.env.PORT || 3000

gulp.task('default', function() {
  var server = gls.static(['src'], port);
  server.start();
  //live reload changed resource(s)
  gulp.watch(['src/**/*'], server.notify);
});
