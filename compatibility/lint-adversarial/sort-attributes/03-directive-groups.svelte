<script>
	let h = () => {};
	let v = '';
	let foo = () => {};
	let fade = () => {};
	let fly = () => {};
</script>

<input on:input={h} bind:value={v} />
<div use:foo transition:fade>a</div>
<div transition:fade use:foo>b</div>
<div out:fade in:fly>c</div>
