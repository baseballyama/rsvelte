<script>
	import { SvelteSet } from './my-set.js';
	let s = $state(new SvelteSet());
</script>

{s.size}
