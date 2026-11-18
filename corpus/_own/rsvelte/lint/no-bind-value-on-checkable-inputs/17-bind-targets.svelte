<script>
  import { writable } from 'svelte/store';
  const store = writable('');
  let obj = { v: '' };
  let arr = [''];
</script>

<input type="checkbox" bind:value={obj.v} />
<input type="radio" bind:value={arr[0]} />
<input type="checkbox" bind:value={$store} />
