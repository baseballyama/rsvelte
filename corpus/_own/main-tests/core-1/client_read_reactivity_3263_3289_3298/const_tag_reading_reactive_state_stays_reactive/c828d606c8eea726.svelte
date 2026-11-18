<script>
	let s = $state("A");
	function go() { s = "B"; }
</script>
<button onclick={go}>b</button>
{#if true}{@const w = s}{#if true}{@const c = String(w)}{c}{/if}{/if}