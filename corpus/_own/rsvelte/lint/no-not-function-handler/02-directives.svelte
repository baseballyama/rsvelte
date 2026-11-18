<script>
	function real() {}
</script>

<button on:click={{ a: 1 }}>o</button>
<button on:click|preventDefault={[1]}>m</button>
<button on:click|once|capture={'s'}>mm</button>
<button on:click={real}>ok</button>
<button on:click>fwd</button>
