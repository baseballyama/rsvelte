<script>
	import { readable as r } from 'svelte/store';
	import * as S from 'svelte/store';

	const a = r(0, (foo) => foo);
	const b = S.writable(1, (bar) => bar);
	const c = S['readable'](2, (baz) => baz);
</script>

<p>{$a} {$b} {$c}</p>
