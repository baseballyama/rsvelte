<script>
  let { value = $bindable(4), other: renamed = $bindable(7) } = $props();
</script>
<button class="value" onclick={() => value++}>value {value}</button>
<button class="other" onclick={() => renamed += 2}>other {renamed}</button>
<input class="input" type="number" bind:value />
