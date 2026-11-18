<div class="host">
  <span class="child">a</span>
  <b>b</b>
</div>

<style>
  .host {
    color: red;

    & .child {
      color: blue;
    }

    &.host {
      color: green;
    }

    > b {
      color: teal;
    }

    &:hover {
      color: olive;
    }
  }

  :global(.leading) .host {
    color: navy;
  }

  .host :global(.trailing) {
    color: maroon;
  }

  .host:global(.compound) {
    color: purple;
  }

  :global {
    .bare-block {
      color: silver;
    }
  }

  .host :is(.child, b) {
    color: gray;
  }

  .host :where(.child, b) {
    color: black;
  }

  :is(.host) :global(.mixed) {
    color: lime;
  }
</style>
