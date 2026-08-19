<script>
	import { writable } from 'svelte/store';

	class Holder {
		field = writable(0, async () => {});

		static {
			writable(0, async () => {});
		}

		method() {
			return writable(0, async () => {});
		}
	}

	const h = new Holder();
</script>

<p>{h.method()}</p>
