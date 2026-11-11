<script>
	import { writable } from 'svelte/store';

	let stable = $state(writable(false));
	let reassigned = $state(writable(false));
	reassigned = writable(true);

	$stable = true;
	$reassigned = true;
</script>

<p>{$stable} {$reassigned}</p>
