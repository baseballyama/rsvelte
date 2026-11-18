<style lang="scss">
  .chart {
    // An apostrophe opens CSS's string state.
    padding: 1px;

    // This nested rule is swallowed with the comment value.
    .child {
      display: block;
    }

    // A second apostrophe closes CSS's string state.
    grid-template-columns: minmax(0, 1fr);

    // This is the first block item both parsers reject.
    @include mobile {
      padding: 0;
    }
  }
</style>
