<script>
	export let a;
	export let s;
</script>

{#if /&&/.test(s) && a}
	<p>1</p>
{:else if a}
	<p>2</p>
{/if}

{#if a}
	<p>3</p>
{:else if /&&/.test(s) && a}
	<p>4</p>
{/if}

{#if /x/.test(s)}
	<p>5</p>
{:else if /x&&y/.test(s)}
	<p>6</p>
{/if}
