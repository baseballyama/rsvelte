<script>
	export let x;
</script>

{#if x === 1}
	<p>1</p>
{:else if x === 1.0}
	<p>2</p>
{/if}

{#if x === 0x1f}
	<p>3</p>
{:else if x === 0x1f}
	<p>4</p>
{:else if x === 0X1F}
	<p>5</p>
{/if}
