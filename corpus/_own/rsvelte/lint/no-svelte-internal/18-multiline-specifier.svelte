<script>
	import {
		noop,
		// 'svelte' is a decoy here
		run
	} from 'svelte/internal';
	import {
		mount
	} from 'svelte';
	void [noop, run, mount];
</script>
<p>multiline import clauses</p>
