<script>
	import { writable } from 'svelte/store';

	const s = writable(0);

	class Holder {
		constructor() {
			s.subscribe();
		}

		static {
			s.subscribe();
		}

		method() {
			s.subscribe();
			return 1;
		}
	}

	const h = new Holder();
</script>

<p>{h.method()}{$s}</p>
