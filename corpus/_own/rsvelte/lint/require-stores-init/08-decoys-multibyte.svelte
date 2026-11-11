<script>
	import { writable } from 'svelte/store';

	// writable() in comment
	const str = 'writable()';
	const 空 = /* 🈳 */ writable();
</script>

<p>{str} {$空}</p>
