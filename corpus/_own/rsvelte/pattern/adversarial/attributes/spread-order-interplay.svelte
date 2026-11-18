<script>
	let value = $state('v');
	const a = { title: 'a', 'data-k': '1' };
	const b = { title: 'b', tabindex: 0 };
	function oninput(e) {
		value = e.target.value;
	}
</script>

<input {...a} {value} {...b} {oninput} />
<div {...a} class="mid" {...b} title="last">{value}</div>
<button {...a} onclick={() => (value += '!')} {...b} disabled={false}>go</button>
