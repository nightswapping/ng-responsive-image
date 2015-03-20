describe('Responsive image src - image matcher', function () {
  'use strict';

  var $window,
      imgObj,
      matchImage;

  beforeEach(module('ng-responsive-image.matcher'));

  function injector (_matchImage_) {
    matchImage = _matchImage_;

    imgObj = {
      url_100x100: 'http://image1.example.com',
      url_200x200: 'http://image2.example.com',
      url_300x300: 'http://image3.example.com',
      url_300x200: 'http://image4.example.com',
      url_600x400: 'http://image5.example.com',
      url_900x600: 'http://image6.example.com',
      // Just put in some random keys to make sure we can support that and filter them out.
      id: '0000',
      content_object: '/user/1111'
    };
  }

  describe('pixel density === 1 environment', function () {

    beforeEach(module(function ($provide) {
      // Remotely control the evaluated pixel density. If all query matches fail, it's assumed to be 1
      $window = { matchMedia: jasmine.createSpy('matchMedia').and.returnValue({ matches: false }) };
      $provide.value('$window', $window);
    }));

    beforeEach(inject(injector));

    it('should select a perfect match', function () {
      expect(matchImage(imgObj, 300, 1.5)).toEqual('http://image4.example.com');
    });

    it('should select the highest still fitting ratio in the absence of an exact match', function () {
      expect(matchImage(imgObj, 300, 2)).toEqual('http://image4.example.com');
    });

    it('should throw if there is no image with an appropriate ratio', function () {
      expect(function () { matchImage(imgObj, 300, 0.8); }).toThrow();
    });

    it('should select the smallest possible large enough image in the absence of an exact match', function () {
      expect(matchImage(imgObj, 150, 1)).toEqual('http://image2.example.com');
    });

    it('should throw if there is no image large enough to fit', function () {
      expect(function () { matchImage(imgObj, 1000, 1.5); }).toThrow();
    });

    it('should work with specific cases where the highest viable ratio images would not be large enough', function () {
      imgObj = {
        url_100x100: 'http://image1.example.com',
        url_200x200: 'http://image2.example.com',
        url_300x300: 'http://image3.example.com',
        url_200x300: 'http://image4.example.com',
        url_400x600: 'http://image5.example.com',
        url_600x900: 'http://image6.example.com'
      };
      expect(matchImage(imgObj, 400, 1.2)).toEqual('http://image5.example.com');
    });

  });

  describe('pixel density ===3 3 environment', function () {

    beforeEach(module(function ($provide) {
      $window = { matchMedia: jasmine.createSpy('matchMedia').and.returnValue({ matches: true }) };
      $provide.value('$window', $window);
    }));

    beforeEach(inject(injector));

    it('should select a perfect match for a higher pixel density', function () {
      expect(matchImage(imgObj, 300, 1.5)).toEqual('http://image6.example.com');
    });

    it('should do the best possible choice when neither width nor ratio have an exact match', function () {
      expect(matchImage(imgObj, 60, 1.3)).toEqual('http://image2.example.com');
    });
  });

  describe('input checks', function () {

    beforeEach(inject(injector));

    it('should throw if it lacks a ratio', function () {
      expect(function () { matchImage(imgObj, 300); }).toThrow();
    });

    it('should throw if it lacks a width', function () {
      expect(function () { matchImage(imgObj, undefined, 1.5); }).toThrow();
    });

    it('should throw if it lacks an img object', function () {
      expect(function () { matchImage(undefined, 300, 1.5); }).toThrow();
    });

    it('should throw if fed an incorrect img object', function () {
      imgObj = {
        '100_100': 'http://image1.example.com',
        '200_200': 'http://image2.example.com'
      };
      expect(function () { matchImage(imgObj, 100, 1); }).toThrow();
    });
  });
});