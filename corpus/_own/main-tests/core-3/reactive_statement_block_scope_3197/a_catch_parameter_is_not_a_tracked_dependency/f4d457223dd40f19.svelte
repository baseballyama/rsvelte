<script>
	export let a = 1;
	let d = 0;
	let e = 0;
	function bump() { e++; }
	$: try { d = a; } catch (e) { d = 0; }
</script>
<b>{d}{e}</b><button on:click={bump}>x</button>
