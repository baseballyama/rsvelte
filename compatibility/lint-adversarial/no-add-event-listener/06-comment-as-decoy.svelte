<script>
	function go(handlers) {
		(handlers.addEventListener /* alias as any */)('x', () => {});
	}
</script>

<p>{typeof go}</p>
