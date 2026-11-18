<script>
	let café = $state(1);
	let 日本語 = $state('あ');
	let id = 2;
	const π = Math.PI;
	function 更新() {
		café += 1;
		日本語 += 'い';
	}
</script>

<button onclick={更新}>{café} {日本語} {id} {π.toFixed(2)}</button>
