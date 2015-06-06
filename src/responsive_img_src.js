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
        src: '=rSrc'
      },
      link: function linkResponsiveSrc (scope, element, attrs) {
        var width, ratio, unwatch;

        // Calculate the constraints. We only need to do this once.
        constraints();

        function waitForFirstLoad () {

          // First load has not happened and we have not started watching yet
          if (!unwatch && !findPropToWatch(scope.src)) {
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
          if (!scope.src) {
            // We don't want anything to happen until scope.src actually receives a value.
            return;
          }

          // Handle values as well as then-able promises
          $q.when(scope.src).then(setImage);

          function setImage (src) {
            var url = matchImage(src, width, ratio);
            if (element.attr('background')) {
              element.css('background-image', 'url(' + url + ')');
            } else {
              element.attr('src', url);
            }
          }
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
            throw new Error('rSrc needs either a width or an element with a CSS applied width');
          }

          // For ratio, take an explicit ratio, calculate it from an explcit height, or from an actual height
          ratio = +attrs.ratio ||
                  (attrs.height ? (width / attrs.height) : (width / element[0].clientHeight));

          // If no ratio was specified or possible to calculate (for the lack of an explicit or CSS-defined height),
          // throw. NB: x / 0 where x is a number returns Infinity.
          if (!ratio || ratio === Infinity) {
            throw new Error('rSrc needs either a height, a ratio, or an element with a CSS applied height');
          }
        }
      }
    };
  }

}(angular.module('ng-responsive-image', [
  'ng-responsive-image.matcher'
])));