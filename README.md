# ng-responsive-image

Lightweight solution for responsive images in angularjs apps.

## Summary

`ng-responsive-image` selects the best possible image from a list you provide and replaces the image's src field with it. It works off images with a placeholder src (this could be a 1x1 px transparent GIF or something more user friendly), and a list of images. Here's a quick example

```html
<div>
  <img src="transparent-placeholder.gif" r-src="imageObject">
</div>
```

```css
div {
  width: 600px;
}

img {
  width: 100%;
  height: 300px;
}
```

```javascript
// This object should probably come from your server
$scope.imageObject = {
  300x150: 'http://example.com/image1',
  600x300: 'http://example.com/image2',
  900x900: 'http://example.com/image3'
}
```

Will result in :

```html
<div>
  <img src="http://example.com/image2" r-src="imageObject">
</div>
```

### Features

You can trust `ng-responsive-image` to :

- Find a perfect fit among the provided images
- Select the best possible image even if there is no perfect match (it will pick the smallest image large enough to fit, and the least tall image that will still fulfill the constraints).
- Take into account the target screen's pixel density: it will simply double or triple the width constraint (You can configure this behavior).
- Work with background images through the `background="true"` attribute.

You should not trust `ng-responsive-image` to :

- Position your images and manage your responsive CSS.
- Crop or in any way size your images to fit (this should be done server-side by a proxy).
- Fetch larger images on resize/deviceorientation events.

### Placeholder images

We believe it's a good practice to use placeholder images while your javascript is loading. It tells the user something is currently loading, and avoids those unstable interfaces that constantly move while additional images load.

`ng-responsive-image` does not force you to use those. However, it _will fail_ on image tags with CSS defined height and width if there is no `src` attribute. This is because browsers don't display images without a `src`. Such images have 0 width and height and `ng-responsive-image` just cannot select the best image for them.

It should work fine without placeholders if you use divs with background="true" and / or specify constraints through HTML attributes.

### Image size constraints

There are three ways to specify contraints to `ng-responsive-image`.

__Natively through CSS.__ If your image has a width and a height, and is actually displayed (meaning it has a src placeholder), `ng-responsive-image` will use these as constraints.

__Through HTML attributes.__ You can specify two of __width__, __height__ and __ratio__ on your image and `ng-responsive-image` will get the best image for this set of constraints.

__By using both.__ You can mix and match the first two approaches: CSS width and height attribute, CSS height and ratio attribute, etc.

## Documentation

### Installation

This module is available through npm and bower.

```bash
npm install ng-responsive-image --save
# or
bower install ng-responsive-image --save
```

Add `{modules_folder}/ng-responsive-image/dist/ng-responsive-image.js` to your build and to your index.html file. Then simply require it in your module's dependencies list, like this :

```javascript
angular.module('myModule', [
 // Various dependencies
 'ng-responsive-image'
])
```

You're good to go, you can now use r-src in your templates !

### API docs

#### Required: image object

Directly pass this value to the directive through `r-src="imageObject"`. This is bound and the directive will replace the image if the imageObject is mutated or replaced. Here's the expected format : `url_[[ WIDTH ]]x[[ HEIGHT ]]: '[[ URL ]]'`. You can mix and match ratios in the same object as `ng-responsive-image` can select the most appropriate one.

NOTE: This image object can be passed directly as a value (eg. the object below), or as a then-able promise that will resolve to a properly formatted object. In which case the directive will wait for the promise to be resolved before selecting the image and placing it as src.

```javascript
{
  url_10x10: 'http://example.com/image1',
  url_100x100: 'http://example.com/image2',
  url_500x200: 'http://example.com/image3'
}
```

#### Required: two of width/height/ratio

`ng-responsive-image` needs at least 2 for these 3 informations: width, height or ratio. All three can be input as HTML attributes (in pixels for width and height). You can also specify width and height through CSS and `ng-responsive-image` will evaluate the image's actual size. Be careful though, if you do not use a placeholder in the image's src, it will neither have a width nor a height. If you do use placeholders, or work on a div with the background attribute, you will be fine.

#### Optional: background

`ng-responsive-image` can set a background image instead of an `img` element's `src` attribute. Just set `background` to true on the element.

```html
<div r-src="imageObject" background="true">
```

#### Optional: manage pixel density

By default `ng-responsive-image` takes the screen's pixel density into account when chosing the right image. This simply means the required width is multiplied by 2 or 3. If you do not wish for `ng-responsive-image` to exhibit this behavior, or want to override the way it evaluates pixel density, you can.

This functionality is contained in a provider which you can configure through the `provideCustom` method. You can do this in an angular config block. Keep in mind pixel density is generally expressed as an integer between 1 and 4.

```javascript
app.config(function (RSrcPixelDensityProvider) {
  // You can provide a hard value as a number.
  // For example, 1 to just not take pixel density into account at all.
  RSrcPixelDensityProvider.provideCustom(1);

  // Or if you have other means than a media query to determine this,
  // input any number you want.
  RSrcPixelDensityProvider.provideCustom(3);

  // Or you can supply a function that will be used to evaluate the
  // screen's pixel density. It should return a number.
  RSrcPixelDensityProvider.provideCustom(function () { return 1 + 1; });
});
```

## CONTRIBUTING

All contributions are welcome, be they bugs or feature requests. They're even more welcome in the form of Pull Requests.

### Build & tests

Nothing will be merged unless it passes both the linters and the tests. `grunt` will lint your files and run the tests in watch mode so you can make your changes and see if anything breaks.

When you're done, use `grunt build` to generate the `dist/` folder with the default and minified builds. The tests are also run on each of those, just to be sure.