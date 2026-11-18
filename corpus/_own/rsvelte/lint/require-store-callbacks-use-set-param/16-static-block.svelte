<script>
	import { writable } from 'svelte/store';

	class Holder {
		field = writable(0, (start) => start());

		static {
			writable(0, (start) => start());
		}
	}

	const h = new Holder();
</script>

<p>{h.field}</p>
