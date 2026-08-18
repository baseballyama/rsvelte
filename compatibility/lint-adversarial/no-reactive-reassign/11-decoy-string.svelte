<script>
	export let count;
	$: doubled = count * 2;
	const note = 'doubled = 5';
	const re = /doubled = 6/;
	// doubled = 7
	function real() {
		doubled = 8;
	}
</script>

<button on:click={real}>{doubled}{note}{re.source}</button>
