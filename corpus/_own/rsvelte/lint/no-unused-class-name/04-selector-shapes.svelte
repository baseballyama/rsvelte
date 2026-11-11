<div class="g m n w h nested inner">all used via tricky selectors</div>

<style>
  :global(.g) {
    color: red;
  }
  @media (min-width: 10px) {
    .m {
      color: blue;
    }
  }
  :not(.n) {
    color: green;
  }
  :where(.w) {
    margin: 0;
  }
  :has(.h) {
    padding: 0;
  }
  .nested {
    .inner {
      color: gray;
    }
  }
</style>
