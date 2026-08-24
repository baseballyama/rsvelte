<div class="a b">
  <span class="c" data-x="}" title={"{"}>t</span>
  <p id="p-1">p</p>
</div>

<style>
  .a.b > .c ~ p,
  .a:not(.z):is(.b) .c,
  [data-x="}"],
  [title="{"] {
    color: red;
  }

  .a::before {
    content: "} { ; :global(.x) /* not a comment */";
  }

  @media (min-width: 1px) and (max-width: 9999px) {
    #p-1 {
      color: blue;
    }
  }

  @supports (display: grid) {
    .a {
      display: grid;
    }
  }
</style>
