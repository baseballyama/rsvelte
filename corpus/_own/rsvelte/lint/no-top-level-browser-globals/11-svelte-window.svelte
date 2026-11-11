<script>
	let w = $state(0);
</script>
<svelte:window bind:innerWidth={w} />
<p>日本語テキスト🚀の後で {document.title} を参照</p>
<p>{w}</p>
