<script>
	let v = $state(1);
</script>

{#if v}{@const c = $props()}<b>{c}</b>{/if}
