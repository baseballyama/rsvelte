<script>
	import { writable } from 'svelte/store';

	function inCatch() {
		try {
			return 1;
		} catch (writable) {
			// the catch param shadows the import inside this block only
			return writable();
		}
	}

	function inBlock() {
		{
			const writable = () => 2;
			return writable();
		}
	}

	function afterBlock() {
		{
			const writable = () => 2;
			writable();
		}
		return 3;
	}

	const real = writable();
</script>

<p>{inCatch()}{inBlock()}{afterBlock()}{real}</p>
