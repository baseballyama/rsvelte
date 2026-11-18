<div class="a"><span class="b">x</span></div>

<style>
  .a:is(2n) {
    color: red;
  }
  .a:not(2n of .a) {
    color: green;
  }
  .a:where(5) {
    color: blue;
  }
  .a:nth-child(-n-1) {
    color: teal;
  }
  .a:nth-child(span) {
    color: navy;
  }
</style>
