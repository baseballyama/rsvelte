<div class="a">
  <span class="b">b</span>
</div>

<style>
  /* before a rule */
  .a /* after a selector */ {
    /* before a declaration */
    color: red; /* after a declaration */
    background: /* before a value */ blue;
  }

  .a,
  /* between two selectors */
  .b {
    margin: 0;
  }

  @media /* in a prelude */ (min-width: 1px) {
    /* before a nested rule */
    .b {
      padding: 0;
    }
  }
  /* at the end */
</style>
