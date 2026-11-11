<style lang="scss">
.a {
  // Vertical offset keeps the row's baseline.
  padding: 1px;
  // hidden but takes space
  .child {}
  // min-size. Carbon's width
  grid: 1fr;
  // target on smaller
  @include mobile {}
}
</style>