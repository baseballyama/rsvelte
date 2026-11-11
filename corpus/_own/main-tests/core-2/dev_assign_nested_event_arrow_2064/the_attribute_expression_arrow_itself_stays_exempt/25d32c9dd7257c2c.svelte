<script>
	let scroll = $state({ x: 0 });
	let x = $state(1);
	function bump() { x += 1; }
</script>

<button onclick={() => (scroll.x = x)}></button>
<button onclick={bump}></button>
