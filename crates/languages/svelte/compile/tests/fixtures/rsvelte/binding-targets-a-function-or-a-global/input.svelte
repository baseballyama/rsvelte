<script>
	export function a() {}
	class K {}
</script>
<input bind:value={a} />
<input bind:value={K} />
<input bind:value={ foo .bar } />
<p bind:this={window.__el}></p>
{a}
