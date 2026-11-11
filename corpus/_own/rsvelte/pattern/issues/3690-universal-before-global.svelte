<div class="g a">direct</div>
<svg><circle class="g" /></svg>

<style>
  @namespace svg url(http://www.w3.org/2000/svg);

  *:global(.g) {
    color: red;
  }

  *.a:global(.g) {
    color: green;
  }

  svg|*:global(.g) {
    color: blue;
  }
</style>
