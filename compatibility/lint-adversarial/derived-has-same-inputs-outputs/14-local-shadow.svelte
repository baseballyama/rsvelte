<script>
	/* eslint svelte/derived-has-same-inputs-outputs: "warn" */
	import { derived, writable } from 'svelte/store';

	const a = writable(0);

	function makeLocal(derived) {
		// `derived` here is the parameter, not the svelte/store import
		return derived(a, (x) => x);
	}

	function blockLocal() {
		const derived = (store, fn) => fn(store);
		return derived(a, (y) => y);
	}

	const real = derived(a, ($a) => $a);
	const r = makeLocal((s, f) => f(s));
	const b = blockLocal();
</script>

<p>{$real}{r}{b}</p>
