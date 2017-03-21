# Suwa

<!-- [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

[![Build Status](https://travis-ci.org/nju33/suwa.svg?branch=master)](https://travis-ci.org/nju33/suwa) -->

📖 Like a carousel element


![screenshot](https://github.com/nju33/suwa/raw/master/images/screenshot.gif?raw=true)

## Install or Download

```sh
yarn add suwa
npm i -S suwa
```

Or access to [releases page](https://github.com/nju33/suwa/releases).
Then, download the latest version.

## Usage

First, if you read as a separate file

```html
<script src="/path/tp/suwa.js"></script>
```

```html
  <!-- ... -->
  <div id="target">
    <div class="page1" style="display:none">...</div>
    <div class="page2" style="display:none">...</div>
    <div class="page3" style="display:none">...</div>
    <div class="page." style="display:none">...</div>
    <div class="page." style="display:none">...</div>
    <div class="page." style="display:none">...</div>
    <div class="pageN" style="display:none">...</div>
  </div>
  <!-- ... -->
```

```js
import Suwa from 'suwa';

window.addEventListener('load', () => {
  new Suwa({
    target: getElementById('target'),
    data: {
      style: {
        // defaults
        height: '50vh',
        width: '100vw',
        baseColor: '#fff',
        subColor: '#222',
        accentColor: '#cb1b45'
      },

      // Whether to display progressbar on top (default: false)
      progress: true,
      
      // Whether or not to loop a page (default: false)
      pagerLoop: {
        // Whether it will go automatically to the next page when it is left // alone, how many milliseconds it will go to the next page
        autoScroll: 3000,
      },

      // To operate with the keyboard Set
      // default: false
      keyMaps: {
        prevPage: 37,
        nextPage: 39
      },

      // Whether to move the page with the side-wheel (horizontal swipe on smart-device)
      // (default: false)
      wheel: true

      // Whether to display pager
      // defaults
      pager: {
        inset: true // If false Pager display outside the page
      },
    }
  });
})
```

### Example

- `test/fixtures/index.js`
- `example/webpack/index.js`

## LICENSE

The MIT License (MIT)

Copyright (c) 2017 nju33 <nju33.ki@gmail.com>
