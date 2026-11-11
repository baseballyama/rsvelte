<script module>
	export class M { a = $state(1); b = ($derived(this.a + 1)); }
</script>
<script>
	let base = $state(3);
</script>
<p>{base}</p>
