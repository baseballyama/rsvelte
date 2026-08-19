<script>
	export let count;
	$: var fn = () => count;
	$: function decl() {
		return count;
	}
	void [fn, decl];
</script>

{count}
