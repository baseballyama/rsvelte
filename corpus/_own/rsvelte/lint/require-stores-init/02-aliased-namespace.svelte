<script>
	import { writable as w } from 'svelte/store';
	import * as S from 'svelte/store';

	const a = w();
	const b = S.readable();
	const c = S['writable']();
</script>

<p>{$a} {$b} {$c}</p>
