module.exports = function (karma) {
  'use strict';

  karma.set({

    basePath: './',
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'src/**/*.js',
      'tests/**/*.js'
    ],

    frameworks: [ 'jasmine' ],
    plugins: [ 'karma-jasmine', 'karma-firefox-launcher' ],

    reporters: 'dots',

    port: 9018,
    runnerPort: 9100,
    urlRoot: '/',

    singleRun: true,
    autoWatch: false,

    browsers: [ 'Firefox' ]
  });
};