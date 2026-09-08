# `3256-svg-content-attributes.svelte`

**Issue:** [#3256](https://github.com/baseballyama/rsvelte/issues/3256)

Dynamic `innerHTML`, `innerText` and `textContent` use `$.set_attribute` on SVG elements while the same names remain DOM-property assignments on HTML elements. The HTML control prevents fixing the SVG side by globally removing the names from the property table.
