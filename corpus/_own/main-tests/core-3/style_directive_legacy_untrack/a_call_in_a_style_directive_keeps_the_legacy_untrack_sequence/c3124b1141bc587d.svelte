<script>
	import { DEV } from 'esm-env';
	export let theme = undefined;
	const show = false;
	function rnd() { return '#fff'; }
	$: total = 1;
</script>
<div style:background={DEV && show ? rnd() : null}></div>
