<div class="a"><span class="b">x</span></div>

<style>
  div:is(.a /* t */) {
    color: red;
  }
  div:where(/* l */ .a) {
    color: green;
  }
  div:not(.a /* m */, .b) {
    color: blue;
  }
  div:has(.b /* z */) {
    color: teal;
  }
</style>
