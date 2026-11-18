<div class="a">
  <span class="b">b</span>
  <p class="c">c</p>
</div>

<style>
  .a:has(> .b) {
    color: red;
  }

  .a:has(.b, .c) {
    color: blue;
  }

  .a:not(:has(.missing)) {
    color: green;
  }

  .a :is(.b, .c):where(.b, .c) {
    color: teal;
  }

  .a > :nth-child(2 of .c) {
    color: olive;
  }

  .a > .b + .c ~ .c {
    color: gray;
  }

  .a [class]:not([hidden]) {
    color: navy;
  }

  @scope (.a) to (.c) {
    .b {
      color: maroon;
    }
  }
</style>
