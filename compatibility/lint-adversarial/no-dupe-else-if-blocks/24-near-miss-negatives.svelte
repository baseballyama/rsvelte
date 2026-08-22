<script>
	export let a;
	export let b;
	export let c;
</script>

{#if a}
	<p>1</p>
{:else if b}
	<p>2</p>
{:else if c}
	<p>3</p>
{/if}

{#if a && b}
	<p>4</p>
{:else if a || b}
	<p>5</p>
{/if}

{#if a}
	<p>6</p>
{/if}
{#if a}
	<p>7</p>
{/if}

{#if a}
	<p>8</p>
{:else}
	<p>9</p>
{/if}

{#if a === b}
	<p>10</p>
{:else if b === a}
	<p>11</p>
{/if}
