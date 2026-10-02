<script lang="ts">
  import Inspect from 'svelte-inspect-value'

  let number = $state(1)
  let isEven = $derived(number % 2 === 0)
  let doubled = $derived(number * 2)

  const Ins = Inspect.Values.withOptions(() => ({
    expandLevel: 0,
    elementAttributes: { style: 'max-width: 500px', class: 'not-content mt' },
  }))
</script>

<div>
  <input type="number" bind:value={number} />

  <Ins {number} {isEven} {doubled} />
</div>

<style>
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;
  }

  input {
    max-width: 4em;
  }
</style>
