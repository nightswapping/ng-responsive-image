(function (app) {
  'use strict';

  app.factory('matchImage', matchImageFactory);

  matchImageFactory.$inject = [ '$window', 'RSrcPixelDensity' ];
  function matchImageFactory ($window, RSrcPixelDensity) {
    // RSrcPixelDensity should be an integer between 1 and 4 representing the screen's pixel density.

    return function matchImage (imgObj, width, ratio) {

      if (!imgObj || !width || !ratio) {
        throw new Error('r-src must be provided an src object, a width and a ratio.');
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
          throw new Error('Unexpected image object. rSrc needs keys of the form url_000x000 with urls as values');
        }
        return [ ratio, width, imgObj[item] ];
      })

      // Filter out non-img items and find images that match the exact ratio or taller
      .filter(function filterImagesByRatio (item, index, array) {
        return item && +item[0] <= +ratio;
      })

      // Find images large enough to fit, or larger
      .filter(function filterImagesByWidth (item, index, array) {
        return +item[1] >= width * RSrcPixelDensity;
      })

      // Sort images by ratio for simpler selection
      .sort(function sortImagesByRatio (a, b) {
        return a[0] - b[0];
      })

      // Keep only the highest ratio images. If we have an exact match, those will be it. Otherwise those will be
      // the least tall images that are still tall enough to fit - we can't leave empty spaces.
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
        throw new Error('No image in src fitting width (' + width + '), ' +
          'pixel density (' + RSrcPixelDensity + '), & ratio (' + ratio + ') constraints');
      }

      return match[2];
    };
  }

})(angular.module('ng-responsive-image.matcher', [
  'ng-responsive-image.pixel-density'
]));