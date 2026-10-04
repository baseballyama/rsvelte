<script>
  import Child from '../async-pending-effect-child/input.svelte';
  let value = $state(1);
  let jobs = [];
  const work = (value) => new Promise((resolve) => jobs.push(() => resolve(value * 2)));
  const finish = () => jobs.splice(0).forEach((resolve) => resolve());
</script>
<button id="finish" onclick={finish}>finish</button>
<button id="change" onclick={() => value++}>change</button>
<svelte:boundary>
  <Child {value} {work} />
  {#snippet pending()}<em>loading</em>{/snippet}
</svelte:boundary>
