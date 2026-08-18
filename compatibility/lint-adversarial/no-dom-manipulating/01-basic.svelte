<script>
	let div;
	let child;

	function go() {
		div.appendChild(child);
		div.textContent = 'x';
		div.dataset.foo = 'y';
		const read = div.textContent;
		return read;
	}
</script>

<div bind:this={div}>a</div>
<span bind:this={child}>b</span>
<button on:click={go}>go</button>
