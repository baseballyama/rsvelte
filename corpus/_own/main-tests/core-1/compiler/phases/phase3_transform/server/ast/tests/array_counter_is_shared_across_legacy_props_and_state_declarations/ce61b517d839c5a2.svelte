<script>
	export let [a, b] = [1, 2];
	let [c, d] = [3, 4];
	function inc() {
		c++;
		d++;
	}
</script>

<button onclick={inc}>{a}{b}{c}{d}</button>