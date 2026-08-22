<script module>
	import { writable as w } from 'svelte/store';

	export { w as makeStore };

	const KEY = 'writable';
	export const viaConstKey = w();
</script>

<script>
	import * as ns from 'svelte/store';

	const a = ns[KEY]();
	const b = makeStore();
</script>

<p>{a}{b}{viaConstKey}</p>
