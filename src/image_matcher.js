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

      // There's no matching image. Just return the largest image we have and hopefully the user will not notice
      if (!match) {
        var largestImageKeyMatch = Object.keys(imgObj)
        .map(function (key) { return key.match(/^url_(\d+)x(\d+)$/); })
        .reduce(function (acc, matchedKey) {
          if (!matchedKey || !matchedKey[1] || acc && acc[1] > matchedKey[1]) {
            return acc;
          }
          else {
            return matchedKey;
          }
        });

        if (!largestImageKeyMatch) {
          console.error(new Error('The image object does not contain any proper image properties.'));
          return;
        }

        console.warn('No image for ' + width + 'px/' + RSrcPixelDensity + '/' + ratio + '. Falling back to largest.');
        return imgObj[largestImageKeyMatch[0]];
      }

      return match[3];
    };
  }

})(angular.module('ng-responsive-image.matcher', [
  'ng-responsive-image.pixel-density'
]));