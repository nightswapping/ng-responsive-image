/**!
 * ng-responsive-image - v0.1.9 - 2015-10-20
 *
 * Copyright (c) 2015 [object Object]
 * Distributed under the MIT licence
 */
(function (app) {
  'use strict';

  app.factory('matchImage', matchImageFactory);

  matchImageFactory.$inject = [ '$window', 'RSrcPixelDensity' ];
  function matchImageFactory ($window, RSrcPixelDensity) {
    // RSrcPixelDensity should be an integer between 1 and 4 representing the screen's pixel density.

    return function matchImage (imgObj, width, height, ratio) {

      if (!imgObj || !width || !height || !ratio) {
        console.error(new Error('r-src must be provided an src object, a width and a ratio.'));
        return;
      }

      // Iterate over src to find the best possible match
      var match = Object.keys(imgObj)

      // Format the incoming data into an easily iterable format
      // Assume data in a format like { url_100x100: 'https://example.com', ... }
      .map(function formatImageObject (item, index, array) {
        var m      = item.match(/^url_(\d+)x(\d+)$/);

        if (!m) {
          // This will allow properties that do not contain image urls into those objects : things
          // like IDs, content object references, etc.
          return null;
        }

        var width  = m[1],
            height = m[2],
            ratio  = width / height;
        if (!width || !height || !ratio) {
          console.error(new Error('Unexpected image object. rSrc needs keys of the form url_0x0 with urls as values'));
          return;
        }
        return [ ratio, width, height, imgObj[item] ];
      })

      // Remove falsy values such as null
      .filter(function removeFalsyValues (item, index, array) {
        return !!item;
      })

      // Find images tall enough to fit
      .filter(function filterImagesByHeight (item, index, array) {
        return +item[2] >= height * RSrcPixelDensity;
      })

      // Find images large enough to fit, or larger
      .filter(function filterImagesByWidth (item, index, array) {
        return +item[1] >= width * RSrcPixelDensity;
      })

      // Sort images by ratio for simpler selection
      .sort(function sortImagesByRatio (a, b) {
        return a[0] - b[0];
      })

      .filter(function pickExactRatio (item, index, array) {
        // If there are exact match ratio images in the imgObj, pick those
        if (array.filter(function (item) { return item[0] === ratio; })[0]) {
          return item[0] === ratio;
        }

        // Otherwise do nothing, we will select the proper images below
        else {
          return true;
        }
      })

      // Keep only the highest ratio images. If we have an exact match, it's all that will be left anyway.
      // Otherwise this will leave us with the least all images still tall enough to fit
      .reduceRight(function keepHighestRatioImages (acc, item, index, array) {
        return (acc.length > 0) && (+item[0] < acc[0][0]) ? acc : acc.concat([ item ]);
      }, [])

      // Keep the smallest image that did fit. If there's only one image, this will be it.
      .reduce(function keepSmallestWidthImages (acc, item, index, array) {
        return !acc ? item :                        // If there's nothing yet, take the first item that comes
          (+item[1] < +acc[1]) ? item : acc;        // If the item is smaller than what we had, take it instead
      }, false); // Avoid a TypeError to allow our smarter reporting right below.

      // Programmer error, we should just throw and try to be helpful
      if (!match) {
        console.error(new Error('No image in src fitting width (' + width + '), ' +
          'pixel density (' + RSrcPixelDensity + '), & ratio (' + ratio + ') constraints'));
        return;
      }

      return match[3];
    };
  }

})(angular.module('ng-responsive-image.matcher', [
  'ng-responsive-image.pixel-density'
]));
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
/**
 * Responsive images directive
 *
 * This module adds a directive that selects images based on width & ratio as constraints, and the
 * device's pixel density, and takes the best possible image fitting those criteria.
 *
 * Lacking a match, it will throw with the data it was fed.
 */
(function (app) {
  'use strict';

  app.directive('rSrc', rSrc);

  rSrc.$inject = [ '$q', 'matchImage' ];
  function rSrc ($q, matchImage) {

    return {
      restrict: 'A',
      scope: {
        src: '=rSrc',
        image_is_loaded: '=?imageIsLoaded'
      },
      link: function linkResponsiveSrc (scope, element, attrs) {
        var width, height, ratio, unwatch, deferred;

        deferred = $q.defer();
        scope.image_is_loaded = deferred.promise;

        // Calculate the constraints. We only need to do this once.
        constraints();

        function waitForFirstLoad () {

          // We have a promise or a broken angular-resource-instance with the promise hidden under $promise,
          // but it is not resolved yet as there is no propToWatch
          if (!unwatch && scope.src && !findPropToWatch(scope.src) && (scope.src.$promise || scope.src.then)) {
            (scope.src.$promise || scope.src).then(function () {
              // When the promise is resolved, move on to wait for subsequent loads, or throw if there are no usable
              // properties on the image object
              if (findPropToWatch(scope.src)) {
                waitForSubsequentLoads();
              }

              else {
                var err = new Error('Image object does not contain any appropriate url_ properties');
                deferred.reject(err);
                console.error(err);
                return;
              }
            });
          }

          // First load has not happened, there is no promise and we have not started watching yet
          else if (!unwatch && !findPropToWatch(scope.src)) {
            // Start to watch so we can react when src becomes useful
            unwatch = scope.$watch('src', waitForFirstLoad);
          }

          // First load has happened and we have a useful object
          else if (findPropToWatch(scope.src)) {
            // If we were waiting for that, cancel the watcher
            if (unwatch) { unwatch(); }
            // Trigger the watch that will actually update the image and keep watching for changes
            waitForSubsequentLoads();
          }

          else if (scope.src !== undefined) {
            var err = new Error('Image object does not contain any appropriate url_ properties');
            deferred.reject(err);
            console.error(err);
            return;
          }
        }

        function waitForSubsequentLoads () {

          // Set the image again every time the bound image object changes (without recalculating constraints)
          // Make sure we keep our $watch active: rebind it when out previous property disappears from the object
          unwatch = scope.$watch('src.' + findPropToWatch(scope.src), function self (newValue, oldValue) {
            // If there is no newValue, the property we were watching on no longer exists, look for another url_
            // property to set our watch on instead.
            if (oldValue && !newValue) {
              unwatch();
              unwatch = scope.$watch('src.' + findPropToWatch(scope.src), self);
            }

            // If there is a new value on the same property we can just keep watching it
            // In any case, since there were changes, update the image
            updateImage();
          });
        }

        // Start waiting for the first load
        waitForFirstLoad();

        function updateImage () {
          // Use our matcher to get the URL we'll be using for the image
          var url = matchImage(scope.src, width, height, ratio);
          // Preload the image using a made-up img element
          var img = document.createElement('img');
          img.src = url;
          img.onload = function () {
            // If we loaded an invalid image, trigger the error callback
            if (img.naturalWidth + img.naturalHeight === 0) {
              return img.onerror();
            }
            // Resolve the promise so the consumer knows we succeeded
            deferred.resolve();
            // Do set the image in place
            if (element.attr('background')) {
              element.css('background-image', 'url(' + url + ')');
            } else {
              element.attr('src', url);
            }
          };
          // Reject the promise so the error bubbles up
          img.onerror = function () {
            deferred.reject('Failed to load an image.');
          };
        }

        // Find an url_ property on the imgObj to run the $watch on. This is less expensive than deep watching the
        // entire object and ensures we can also catch a mutation of the image properties on it.
        function findPropToWatch (imgObj) {
          for (var prop in imgObj) {
            if (prop.indexOf('url_') === 0) {
              return prop;
            }
          }
        }

        // NB: constraints actually mutates on the parent's width & ratio variables.
        function constraints () {

          // For width, simply take the attribute, or, for lack thereof, the element's actual width
          width = +attrs.width           ||
                  element[0].clientWidth ||
                  attrs.height * attrs.ratio   ||
                  element[0].clientHeight * attrs.ratio;

          // If nothing is explicitly specified and the CSS does not handle width either, throw
          if (!width) {
            console.error(new Error('rSrc needs either a width or an element with a CSS applied width'));
            return;
          }

          // For height, take the attribute, calculate if with the ratio, or take the element's actual height
          height = +attrs.height             ||
                   attrs.width / attrs.ratio ||
                   element[0].clientHeight   ||
                   element[0].clientWidth / attrs.ratio;

          if (!height) {
            console.error(new Error('rSrc needs either a height, a ratio or an element with a CSS applied height'));
            return;
          }

          // For ratio, take an explicit ratio, calculate it from an explcit height, or from an actual height
          ratio = +attrs.ratio ||
                  (attrs.height ? (width / attrs.height) : (width / element[0].clientHeight));

          // If no ratio was specified or possible to calculate (for the lack of an explicit or CSS-defined height),
          // throw. NB: x / 0 where x is a number returns Infinity.
          if (!ratio || ratio === Infinity) {
            console.error(new Error('rSrc needs either a height, a ratio, or an element with a CSS applied height'));
            return;
          }
        }
      }
    };
  }

}(angular.module('ng-responsive-image', [
  'ng-responsive-image.matcher'
])));