<script lang="ts">
  import Inspect from '$lib/index.js'

  let number = $state(1)
  let isEven = $derived(number % 2 === 0)
  let doubled = $derived(number * 2)

  const Ins = Inspect.Values.withOptions(() => ({
    expandLevel: 0,
    elementAttributes: { style: 'max-width: 500px' },
  }))
</script>

<div class="flex col">
  <input type="number" bind:value={number} />

  <Ins {number} {isEven} {doubled} />
</div>
