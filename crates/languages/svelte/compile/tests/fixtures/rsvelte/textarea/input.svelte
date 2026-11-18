<script>
	let text = $state('');
	let { p = $bindable() } = $props();
	let rest = {};
</script>
<textarea bind:value={text}></textarea>
<textarea bind:value={p} placeholder="x" />
<textarea value="a"></textarea>
<textarea value={text}></textarea>
<textarea value="
x"></textarea>
<textarea>static
text</textarea>
<textarea>
lead</textarea>
<textarea {...rest} bind:value={text}></textarea>
<textarea></textarea>
<textarea value></textarea>
