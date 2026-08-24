<div class="a">
  <div class="b">
    <span class="c">x</span>
    <span class="d">y</span>
  </div>
</div>

<style>
  .a > .b > .c {
    color: red;
  }

  .a .b .c {
    color: blue;
  }

  .a .b > .c + .d {
    color: green;
  }

  .a .b > .c ~ .d {
    color: teal;
  }

  .a > .b > .c {
    color: olive;
  }

  .a,
  .b,
  .c,
  .d {
    color: navy;
  }

  .a .b,
  .a > .b,
  .a + .b,
  .a ~ .b {
    color: maroon;
  }

  .a *,
  .a > * {
    color: purple;
  }

  div.a > div.b span.c {
    color: silver;
  }
</style>
