<script>
	import { writable } from 'svelte/store';

	import Foo from './Foo.svelte';

	const s = writable('x');
</script>

<Foo data={s} msg="a {s}" {s} --color={s} />
<div data-x={s} {s}>t</div>
