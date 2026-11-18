<script>
	import * as ns from 'svelte/store';

	const a = ns?.writable?.();

	class Holder {
		field = ns.readable();
		static staticField = ns.writable();

		static {
			ns.writable();
		}

		method() {
			return ns.derived(a, ($a) => $a);
		}
	}

	const h = new Holder();
</script>

<p>{h.method()}</p>
