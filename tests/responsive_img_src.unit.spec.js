describe('Responsive img src', function () {
  'use strict';

  var $compile,
      fakeCreateElement,
      preloaderImage,
      compileAndMockPreload,
      scope,
      element,
      imgObj,
      transparentGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  beforeEach(module('ng-responsive-image'));
  beforeEach(module('ng-responsive-image.pixel-density', function ($provide) {
    // Eliminate pixel density as a variable as this is not the place to test it
    $provide.value('RSrcPixelDensity', 1);
  }));

  beforeEach(inject(function (_$compile_, $rootScope) {
    $compile = _$compile_;
    scope = $rootScope.$new();

    // We cannot set the fake in place here as the real function is used by $compile.
    // We must thus re-set it after the $compile and before the $apply in each individual test
    spyOn(document, 'createElement').and.callThrough();
    fakeCreateElement = function () {
      preloaderImage = {};
      return preloaderImage;
    };

    compileAndMockPreload = function () {
      // Compile with the real createElement and mock it immediately afterwards
      $compile(element)(scope);
      document.createElement.and.callFake(fakeCreateElement);
      scope.$apply();

      // Simulate a proper image that has loaded, then put back the real createElement
      preloaderImage.naturalWidth = preloaderImage.naturalHeight = 100;
      preloaderImage.onload();
      document.createElement.and.callThrough();
    };

    scope.imgObj = {
      url_100x100: 'http://image1.example.com',
      url_200x200: 'http://image2.example.com',
      url_300x300: 'http://image3.example.com',
      url_300x200: 'http://image4.example.com',
      url_600x400: 'http://image5.example.com',
      url_900x600: 'http://image6.example.com'
    };
  }));

  // NB: we use document.body.appendChild and hand our element a default src because an element not injected
  // into the DOM does not have a width/height, and neither does an image without an src.

  it('sets the proper image src from css defined width & height', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj">');
    document.body.appendChild(element[0]);
    element.css('width', '300px');
    element.css('height', '300px');

    compileAndMockPreload();

    expect(element.attr('src')).toEqual('http://image3.example.com');
  });

  // This is more a proof of concept than a unit test
  it('sets the proper image src from css defined width & height from parent element', function () {
    var parent = angular.element('<div></div>');
    parent.css('width', '300px');
    parent.css('height', '300px');

    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj">');
    element.css('width', '100%');
    element.css('height', '200px');
    parent.append(element);

    document.body.appendChild(parent[0]);

    compileAndMockPreload();

    expect(element.attr('src')).toEqual('http://image4.example.com');
  });

  it('sets the proper image src from css defined width & input ratio', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" ratio="1.5">');
    document.body.appendChild(element[0]);
    element.css('width', '300px');
    element.css('height', 0);

    compileAndMockPreload();

    expect(element.attr('src')).toEqual('http://image4.example.com');
  });

  it('sets the proper image src from css defined with & input height', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" height="500">');
    document.body.appendChild(element[0]);
    element.css('width', '900px');

    compileAndMockPreload();

    expect(element.attr('src')).toEqual('http://image6.example.com');
  });

  it('sets the proper image src from css defined height & input width', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" width="100">');
    document.body.appendChild(element[0]);
    element.css('height', '100px');

    compileAndMockPreload();

    expect(element.attr('src')).toEqual('http://image1.example.com');
  });

  it('sets the proper image src from css defined height & input ratio', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" ratio="1.5">');
    document.body.appendChild(element[0]);
    element.css('height', '400px');

    compileAndMockPreload();

    expect(element.attr('src')).toEqual('http://image5.example.com');
  });

  it('sets the proper image from input height & input ratio', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" ratio="1.5" height="600">');

    compileAndMockPreload();

    expect(element.attr('src')).toEqual('http://image6.example.com');
  });

  it('sets the proper image from input width & input height', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" width="200" height="200">');

    compileAndMockPreload();

    expect(element.attr('src')).toEqual('http://image2.example.com');
  });

  it('sets the proper image as a background image', function () {
    element = angular.element('<div r-src="imgObj" background="true"></div>');
    document.body.appendChild(element[0]);
    element.css('width', '300px');
    element.css('height', '300px');

    compileAndMockPreload();

    expect(window.getComputedStyle(element[0])['background-image']).toEqual('url("http://image3.example.com/")');
  });


  it('does not do anything until imageObject is actually defined and loads the image as soon as it is', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj">');
    document.body.appendChild(element[0]);
    element.css('width', '300px');
    element.css('height', '300px');
    scope.imgObj = null;

    $compile(element)(scope);
    scope.$apply();

    expect(element.attr('src')).toEqual(transparentGif);

    scope.imgObj = {
      url_100x100: 'http://image1.example.com',
      url_200x200: 'http://image2.example.com',
      url_300x300: 'http://image3.example.com',
      url_300x200: 'http://image4.example.com',
      url_600x400: 'http://image5.example.com',
      url_900x600: 'http://image6.example.com'
    };

    // Compile with the real createElement and mock it immediately afterwards
    document.createElement.and.callFake(fakeCreateElement);
    scope.$apply();

    // Simulate a proper image that has loaded, then put back the real createElement
    preloaderImage.naturalWidth = preloaderImage.naturalHeight = 100;
    preloaderImage.onload();
    document.createElement.and.callThrough();

    expect(element.attr('src')).toEqual('http://image3.example.com');
  });

  it('resolves the image_is_loaded promise when it finishes preloading it', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" image-is-loaded="image_is_loaded">');
    document.body.appendChild(element[0]);
    element.css('width', '300px');
    element.css('height', '300px');

    // Compile with the real createElement and mock it immediately afterwards
    $compile(element)(scope);
    document.createElement.and.callFake(fakeCreateElement);
    scope.$apply();

    expect(scope.image_is_loaded.$$state.status).toEqual(0);

    // Simulate a proper image that has loaded, then put back the real createElement
    preloaderImage.naturalWidth = preloaderImage.naturalHeight = 100;
    preloaderImage.onload();
    document.createElement.and.callThrough();

    expect(scope.image_is_loaded.$$state.status).toEqual(1);
  });

  it('rejects the image_is_loaded promise when it fails to preload it', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" image-is-loaded="image_is_loaded">');
    document.body.appendChild(element[0]);
    element.css('width', '300px');
    element.css('height', '300px');

    // Compile with the real createElement and mock it immediately afterwards
    $compile(element)(scope);
    document.createElement.and.callFake(fakeCreateElement);
    scope.$apply();

    expect(scope.image_is_loaded.$$state.status).toEqual(0);

    // Simulate a proper image that has loaded, then put back the real createElement
    preloaderImage.naturalWidth = preloaderImage.naturalHeight = 100;
    preloaderImage.onerror();
    document.createElement.and.callThrough();

    expect(scope.image_is_loaded.$$state.status).toEqual(2);
  });

  it('rejects the image_is_loaded promise when it preloads an invalid image', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" image-is-loaded="image_is_loaded">');
    document.body.appendChild(element[0]);
    element.css('width', '300px');
    element.css('height', '300px');

    // Compile with the real createElement and mock it immediately afterwards
    $compile(element)(scope);
    document.createElement.and.callFake(fakeCreateElement);
    scope.$apply();

    expect(scope.image_is_loaded.$$state.status).toEqual(0);

    // Simulate a proper image that has loaded, then put back the real createElement
    preloaderImage.naturalWidth = preloaderImage.naturalHeight = 0;
    preloaderImage.onload();
    document.createElement.and.callThrough();

    expect(scope.image_is_loaded.$$state.status).toEqual(2);
  });
});