<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
	let flag = true;

	$: s.subscribe();

	label: s.subscribe();

	if (flag) s.subscribe();

	for (let i = 0; i < 1; i++) s.subscribe();

	while (false) s.subscribe();

	switch (flag) {
		case true:
			s.subscribe();
			break;
		default:
			break;
	}
</script>

<p>{$s}</p>
