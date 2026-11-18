<div class="host">
  <span class="child">a</span>
  <span class="other">b</span>
</div>

<style>
  .host:has(> .child) {
    color: red;
  }

  .host:has(.child, .other) {
    color: blue;
  }

  .host:has(:not(.child)) {
    color: green;
  }

  .host:not(:has(.missing)) {
    color: teal;
  }

  .child:not(.other, .missing) {
    color: olive;
  }

  .child:not(:is(.other)) {
    color: navy;
  }

  .host :is(.child:not(.other), .other:not(.child)) {
    color: maroon;
  }

  @starting-style {
    .host {
      opacity: 0;
    }
  }

  .host {
    transition: opacity 1s;

    @starting-style {
      opacity: 0;
    }
  }
</style>
