<script>
	let { b, f } = $props();
</script>

<span on:class={f} class:a={b}></span>
<em on:class={f}></em>
<p on:style={f} style:color={b}></p>

<style>
	em {
		color: red;
	}
</style>
