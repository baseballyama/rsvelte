<script>
  /* eslint svelte/consistent-selector-style: ["warn", { "style": ["id", "class"] }] */
  import Wrapper from './01-type-over-class.svelte';
</script>

<Wrapper>
  <strong class="slotted">inside component slot</strong>
</Wrapper>

<style>
  .slotted {
    color: red;
  }
</style>
