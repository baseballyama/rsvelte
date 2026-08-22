<script>
	let n = $state(0);
</script>

{#if n === 0}
	<i>0</i>
{:else if n === 1}
	<i>1</i>
{:else if n === 2}
	<i>2</i>
{:else if n === 3}
	<i>3</i>
{:else if n === 4}
	<i>4</i>
{:else if n === 5}
	<i>5</i>
{:else if n === 6}
	<i>6</i>
{:else if n === 7}
	<i>7</i>
{:else if n === 8}
	<i>8</i>
{:else if n === 9}
	<i>9</i>
{:else if n === 10}
	<i>10</i>
{:else}
	{#if n > 100}
		<b>big</b>
	{:else if n > 50}
		<b>mid</b>
	{/if}
{/if}
