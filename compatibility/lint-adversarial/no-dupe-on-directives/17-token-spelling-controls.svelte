<script>
	const f = (v) => v;
</script>

<button type="button" on:click={() => f(1e3)} on:click={() => f(1000)}>a</button>
<button type="button" on:click={() => f(0x10)} on:click={() => f(16)}>b</button>
<button type="button" on:click={() => f(1_000)} on:click={() => f(1000)}>c</button>
<button type="button" on:click={() => f('a')} on:click={() => f("a")}>d</button>
<button type="button" on:click={() => f(/a/g)} on:click={() => f(/a/gi)}>e</button>
<button type="button" on:click={() => f(/a/g)} on:click={() => f(/a/g)}>f</button>
