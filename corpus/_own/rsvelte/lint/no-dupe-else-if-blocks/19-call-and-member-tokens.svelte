<script>
	export let a;
	export let o;
	export let f;
</script>

{#if f(a)}
	<p>1</p>
{:else if f( a )}
	<p>2</p>
{/if}

{#if o.a}
	<p>3</p>
{:else if o['a']}
	<p>4</p>
{/if}

{#if o?.a}
	<p>5</p>
{:else if o?.a}
	<p>6</p>
{/if}
