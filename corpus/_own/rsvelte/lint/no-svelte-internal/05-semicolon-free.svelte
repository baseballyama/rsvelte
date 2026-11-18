<script>
	import { tick } from 'svelte'
	import { noop } from 'svelte/internal'
	const after = 1
	void [tick, noop, after]
</script>
<p>semicolon free</p>
