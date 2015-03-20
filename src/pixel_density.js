(function (app) {
  'use strict';

  app.provider('RSrcPixelDensity', RSrcPixelDensityProvider);

  function RSrcPixelDensityProvider () {

    // This lives in a separate provider so that it can be disabled / configured at app startup.
    var pixelDensity =

    (window.matchMedia(
      'only screen and (-webkit-min-device-pixel-ratio: 3), ' + // Safari & iOS Safari & older android browser
      'only screen and (min-resolution: 3dppx), ' +             // Standard - Chrome, Firefox, Chrome for Android
      'only screen and (min-resolution: 288dpi)'                // IE 9-11, Opera Mini
    ).matches) ? 3 :

    (window.matchMedia(
      'only screen and (-webkit-min-device-pixel-ratio: 1.5), ' +
      'only screen and (min-resolution: 1.5dppx), ' +
      'only screen and (min-resolution: 144dpi)'
    ).matches) ? 2 :

    1;

    this.provideCustom = function RSrcCustomPixelDensity (customPixelDensity) {

      if (typeof customPixelDensity === 'number') {
        pixelDensity = customPixelDensity;
      }

      else if (typeof customPixelDensity === 'function') {
        pixelDensity = customPixelDensity();
      }

      else {
        throw new Error('RSrcPixelDensity.provideCustom must be passed either a pixel density as a number or a' +
          ' function to calculate it.');
      }
    };

    this.$get = function RSrcPixelDensityFactory () {
      return pixelDensity;
    };

  }

})(angular.module('ng-responsive-image.pixel-density', [

]));