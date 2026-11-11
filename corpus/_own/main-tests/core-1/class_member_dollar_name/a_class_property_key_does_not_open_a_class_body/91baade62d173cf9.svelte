<script>
	import { writable } from 'svelte/store';
	const count = writable(0);
	const o = { class: 1 };
	function f() {
		{ $count; }
		return $count;
	}
</script>
<p>{f()}{o.class}</p>