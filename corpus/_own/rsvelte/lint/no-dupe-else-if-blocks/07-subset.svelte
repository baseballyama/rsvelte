<script>
	export let a;
	export let b;
	export let c;
	export let d;
	export let e;
</script>

{#if a}
	<p>1</p>
{:else if a && b}
	<p>2</p>
{/if}

{#if c || d}
	<p>3</p>
{:else if d}
	<p>4</p>
{:else if e}
	<p>5</p>
{/if}
