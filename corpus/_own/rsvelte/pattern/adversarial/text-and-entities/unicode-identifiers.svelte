<script>
	let 数値 = $state(0);
	const π = Math.PI;
	let Δx = $derived(数値 * π);
	const _$__ = 'mixed';
	const identA = 'escaped';

	function 増やす() {
		数値 += 1;
	}
</script>

<button onclick={増やす}>{数値} / {Δx} / {_$__} / {identA}</button>
