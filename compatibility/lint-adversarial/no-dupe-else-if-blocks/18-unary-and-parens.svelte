<script>
	export let a;
</script>

{#if !a}
	<p>1</p>
{:else if !a}
	<p>2</p>
{/if}

{#if !a}
	<p>3</p>
{:else if !(a)}
	<p>4</p>
{/if}

{#if typeof a === 'string'}
	<p>5</p>
{:else if typeof a === 'string'}
	<p>6</p>
{/if}
