<script>
	import { tick as t } from 'svelte';
	let v = 0;
	async function bump() {
		await t();
		v = v + 1;
	}
	$: if (v === 0) bump();
</script>

{v}
