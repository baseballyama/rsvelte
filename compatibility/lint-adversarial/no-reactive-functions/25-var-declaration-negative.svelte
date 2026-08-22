<script>
	export let count;
	$: var fn = () => count;
	$: {
		function decl() {
			return count;
		}
		void decl;
	}
	void fn;
</script>

{count}
