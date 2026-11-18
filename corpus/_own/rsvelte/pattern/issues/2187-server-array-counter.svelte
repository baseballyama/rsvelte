<script>
	let [a, b] = $state([1, 2]);
	let [c, d] = $state([3, 4]);

	function inc() {
		a++;
		c++;
	}
</script>

<button onclick={inc}>{a}{b}{c}{d}</button>
