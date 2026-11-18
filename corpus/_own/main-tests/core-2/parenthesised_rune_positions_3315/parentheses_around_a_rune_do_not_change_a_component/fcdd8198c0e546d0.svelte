<script>
	let base = $state(1);
	
	
	class K { a = $state(1); b = $derived(this.a + 1); }
	let k = new K();
</script>
<p>{base}</p>
