<script>
	let html = $state('<b>x</b>');
	let text = $state('t');
</script>

<div contenteditable="true" bind:innerHTML={html}></div>
<div contenteditable bind:textContent={text}></div>
<p>{html.length} {text}</p>
