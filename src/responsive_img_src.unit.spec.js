describe('Responsive img src', function () {
  'use strict';

  var $compile,
      scope,
      element,
      imgObj,
      transparentGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  beforeEach(module('ng-responsive-image'));

  beforeEach(module(function ($provide) {
    // Remotely control the evaluated pixel density. If all query matches fail, it's assumed to be 1
    $provide.value('$window', { matchMedia: jasmine.createSpy('matchMedia').and.returnValue({ matches: false }) });
  }));


  beforeEach(inject(function (_$compile_, $rootScope) {
    $compile = _$compile_;
    scope = $rootScope.$new();

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

  it('should set the proper image src from css defined width & height', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj">');
    document.body.appendChild(element[0]);
    element.css('width', '300px');
    element.css('height', '300px');

    $compile(element)(scope);
    expect(element.attr('src')).toEqual('http://image3.example.com');
  });

  // This is more a proof of concept than a unit test
  it('should set the proper image src from css defined width & height from parent element', function () {
    var parent = angular.element('<div></div>');
    parent.css('width', '300px');
    parent.css('height', '300px');

    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj">');
    element.css('width', '100%');
    element.css('height', '200px');
    parent.append(element);

    document.body.appendChild(parent[0]);
    $compile(element)(scope);
    expect(element.attr('src')).toEqual('http://image4.example.com');
  });

  it('should set the proper image src from css defined width & input ratio', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" ratio="1.5">');
    document.body.appendChild(element[0]);
    element.css('width', '300px');

    $compile(element)(scope);
    expect(element.attr('src')).toEqual('http://image4.example.com');
  });

  it('should set the proper image src from css defined with & input height', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" height="500">');
    document.body.appendChild(element[0]);
    element.css('width', '900px');

    $compile(element)(scope);
    expect(element.attr('src')).toEqual('http://image6.example.com');
  });

  it('should set the proper image src from css defined height & input width', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" width="100">');
    document.body.appendChild(element[0]);
    element.css('height', '100px');

    $compile(element)(scope);
    expect(element.attr('src')).toEqual('http://image1.example.com');
  });

  it('should set the proper image src from css defined height & input ratio', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" ratio="1.5">');
    document.body.appendChild(element[0]);
    element.css('height', '400px');

    $compile(element)(scope);
    expect(element.attr('src')).toEqual('http://image5.example.com');
  });

  it('should set the proper image from input height & input ratio', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" ratio="1.5" height="600">');

    $compile(element)(scope);
    expect(element.attr('src')).toEqual('http://image6.example.com');
  });

  it('should set the proper image from input width & input height', function () {
    element = angular.element('<img src="' + transparentGif + '" r-src="imgObj" width="200" height="200">');

    $compile(element)(scope);
    expect(element.attr('src')).toEqual('http://image2.example.com');
  });

  it('should set the proper image as a background image', function () {
    element = angular.element('<div r-src="imgObj" background="true"></div>');
    document.body.appendChild(element[0]);
    element.css('width', '300px');
    element.css('height', '300px');

    $compile(element)(scope);
    expect(window.getComputedStyle(element[0])['background-image']).toEqual('url("http://image3.example.com/")');
  });
});