<script>
	const addEventListener = 'x';
	let el;

	function go() {
		el?.addEventListener?.('a', () => {});
		el?.['addEventListener']('b', () => {});
		el[addEventListener]('c', () => {});
		(0, el.addEventListener)('d', () => {});
		new EventTarget().addEventListener('e', () => {});
	}
</script>

<div bind:this={el}></div>
<button onclick={go}>go</button>
