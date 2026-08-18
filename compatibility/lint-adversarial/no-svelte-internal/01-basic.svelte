<script>
	import { noop } from 'svelte/internal';
	import * as client from 'svelte/internal/client';
	import flush from 'svelte/internal/disclose-version';
	export { noop as reexported } from 'svelte/internal';
	export * from 'svelte/internal/server';
	void [noop, client, flush];
</script>
<p>basic</p>
