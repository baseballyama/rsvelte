<div class="root">
  <span class="child">c</span>
</div>

<style>
  :global(.outside) .root {
    color: red;
  }

  .root :global(.injected) {
    color: blue;
  }

  .root:global(.combined) {
    color: green;
  }

  :global(.a .b) {
    color: teal;
  }

  :global {
    .bare-block {
      color: gray;
    }
  }

  :global(.wrapper) :global(.both-ends) {
    color: olive;
  }
</style>
