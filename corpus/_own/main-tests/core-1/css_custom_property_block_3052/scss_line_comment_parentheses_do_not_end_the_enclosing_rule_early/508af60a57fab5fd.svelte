<p>x</p>
<style lang="scss">
  .pill {
    // The container (opt-in via `container: pill / inline-size`) is optional.
    --overlap: calc(var(--size) * -0.5);
  }

  @container pill (min-width: 0px) {
    .pill {
      --available: calc(
        100cqi - var(--reserved-inline, 0px)
      );
    }
  }
</style>
