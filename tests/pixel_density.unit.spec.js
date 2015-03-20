describe('Pixel density provider', function () {
  'use strict';

  var RSrcPixelDensity;

  // beforeEach(function () {
  //   window.matchMedia = function () { return { matches: false }; };
  // });

  // beforeEach(module('ng-responsive-image.pixel-density'));

  // beforeEach(inject(function (_RSrcPixelDensity_) {
  //   RSrcPixelDensity = _RSrcPixelDensity_;
  // }));

  it('should test the pixel density and return it', function () {
    // Mock the media queries matcher. If all queries fail, pixel density is 1
    window.matchMedia = function () { return { matches: false }; };

    // Instantiate the module
    module('ng-responsive-image.pixel-density');

    inject(function (RSrcPixelDensity) {
      expect(RSrcPixelDensity).toEqual(1);
    });
  });

  it('should test the pixel density and return it', function () {
    // Mock the media queries matcher. If the first query succeed, no others are tried, pixel density is 3
    window.matchMedia = function () { return { matches: true }; };

    // Instantiate the module
    module('ng-responsive-image.pixel-density');

    inject(function (RSrcPixelDensity) {
      expect(RSrcPixelDensity).toEqual(3);
    });
  });

  describe('configuration through provideCustom', function () {

    it('should take a fixed number through provideCustom', function () {
      // Make a fake module to use module.config on it.
      angular.module('config-test', [])
        .config(function (RSrcPixelDensityProvider) {
          RSrcPixelDensityProvider.provideCustom(2);
        });

      // Instantiate the module and our fake config
      module('ng-responsive-image.pixel-density', 'config-test');

      inject(function (RSrcPixelDensity) {
        expect(RSrcPixelDensity).toEqual(2);
      });
    });

    it('should take a function that returns the pixel density through provideCustom', function () {
      // Make a fake module to use module.config on it.
      angular.module('config-test', [])
        .config(function (RSrcPixelDensityProvider) {
          RSrcPixelDensityProvider.provideCustom(function () {
            return 4;
          });
        });

      // Instantiate the module and our fake config
      module('ng-responsive-image.pixel-density', 'config-test');

      inject(function (RSrcPixelDensity) {
        expect(RSrcPixelDensity).toEqual(4);
      });
    });

    it('should throw if we attempt to provide an incorrect value', function () {
      // Make a fake module to use module.config on it.
      angular.module('config-test', [])
        .config(function (RSrcPixelDensityProvider) {
          RSrcPixelDensityProvider.provideCustom('3');
        });

      // Instantiate the module and our fake config
      module('ng-responsive-image.pixel-density', 'config-test');

      expect(function () { inject(function (RSrcPixelDensity) {}); }).toThrow();
    });
  });
});