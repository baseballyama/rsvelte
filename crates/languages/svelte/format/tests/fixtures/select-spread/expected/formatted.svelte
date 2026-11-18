<script>
  let { options = [], ...rest } = $props();
  let current = $state("x");
</script>

<select {...rest} class="picker" bind:value={current}>
  {#each options as option}
    <option value={option} class:current={option === current}>{option}</option>
  {/each}
  <optgroup label="more">
    <option {...rest}>other</option>
  </optgroup>
</select>

<style>
  option {
    color: teal;
  }
  .current {
    font-weight: bold;
  }
</style>
