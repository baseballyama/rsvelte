<script>
	import { writable } from 'svelte/store';

	const viewport = writable({ distance: 0 });

	function update(fn) {
		fn();
	}

	update(() => {
		let $viewport = { distance: 1 };
		$viewport.distance = 42;
	});
</script>

<p>{$viewport.distance}</p>
