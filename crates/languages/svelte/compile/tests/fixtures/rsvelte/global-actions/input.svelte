<script>
	import { tip, lock } from './a.js';
	let locked = $state(false);
</script>
<svelte:body use:lock={locked} use:tip onclick={() => (locked = !locked)} />
<svelte:document use:tip={'x'} {@attach (n) => console.log(n)} />
<svelte:window use:tip />
