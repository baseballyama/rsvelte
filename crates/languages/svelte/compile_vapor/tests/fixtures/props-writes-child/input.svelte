<script>
  let { value = 4, other: renamed = 7 } = $props();
</script>
<button class="value" onclick={() => value++}>value {value}</button>
<button class="other" onclick={() => renamed += 2}>other {renamed}</button>
