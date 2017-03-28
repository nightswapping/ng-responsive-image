describe('Responsive image src - image matcher', function () {
  'use strict';

  var imgObj,
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

  beforeEach(function () {
    spyOn(console, 'error');
    spyOn(console, 'warn');
  });

  describe('pixel density === 1 environment', function () {

    beforeEach(module(function ($provide) {
      // Remotely control the evaluated pixel density.
      $provide.value('RSrcPixelDensity', 1);
    }));

    beforeEach(inject(injector));

    it('selects a perfect match', function () {
      expect(matchImage(imgObj, 300, 200, 1.5)).toEqual('http://image4.example.com');
    });

    it('selects the highest still fitting ratio in the absence of an exact match', function () {
      expect(matchImage(imgObj, 300, 150, 2)).toEqual('http://image4.example.com');
    });

    it('selects the smallest possible large enough image in the absence of an exact match', function () {
      expect(matchImage(imgObj, 150, 150, 1)).toEqual('http://image2.example.com');
    });

    it('selects the largest img and sends a warning when there is no image large enough to fit', function () {
      expect(matchImage(imgObj, 1000, 666.666, 1.5)).toEqual('http://image6.example.com');
      expect(console.warn).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('works with specific cases where the highest viable ratio images would not be large enough', function () {
      imgObj = {
        url_100x100: 'http://image1.example.com',
        url_200x200: 'http://image2.example.com',
        url_300x300: 'http://image3.example.com',
        url_200x300: 'http://image4.example.com',
        url_400x600: 'http://image5.example.com',
        url_600x900: 'http://image6.example.com'
      };
      expect(matchImage(imgObj, 400, 333.333, 1.2)).toEqual('http://image5.example.com');
    });
  });

  describe('pixel density === 3 environment', function () {

    beforeEach(module(function ($provide) {
      // Remotely control the evaluated pixel density.
      $provide.value('RSrcPixelDensity', 3);
    }));

    beforeEach(inject(injector));

    it('selects a perfect match for a higher pixel density', function () {
      expect(matchImage(imgObj, 300, 200, 1.5)).toEqual('http://image6.example.com');
    });

    it('does the best possible choice when neither width nor ratio have an exact match', function () {
      expect(matchImage(imgObj, 60, 46.15, 1.3)).toEqual('http://image4.example.com');
    });
  });

  describe('input checks', function () {

    beforeEach(inject(injector));

    it('reports an error when it lacks a ratio', function () {
      matchImage(imgObj, 300, 200);
      expect(console.error).toHaveBeenCalledWith(jasmine.any(Error));
    });

    it('reports an error when it lacks a width', function () {
      matchImage(imgObj, undefined, 200, 1.5);
      expect(console.error).toHaveBeenCalledWith(jasmine.any(Error));
    });

    it('reports an error when it lacks a height', function () {
      matchImage(imgObj, 300, undefined, 1.5);
      expect(console.error).toHaveBeenCalledWith(jasmine.any(Error));
    });

    it('reports an error when it lacks an img object', function () {
      matchImage(undefined, 300, 200, 1.5);
      expect(console.error).toHaveBeenCalledWith(jasmine.any(Error));
    });

    it('reports an error when passed an incorrect img object', function () {
      imgObj = {
        '100_100': 'http://image1.example.com',
        '200_200': 'http://image2.example.com'
      };
      matchImage(imgObj, 100, 100, 1);
      expect(console.error).toHaveBeenCalledWith(jasmine.any(Error));
    });
  });
});