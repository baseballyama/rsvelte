<script>
	const addEventListener = 'addEventListener';

	function go(el) {
		el['addEventListener']('a', () => {});
		el[addEventListener]('b', () => {});
	}
</script>

<p>{typeof go}</p>
