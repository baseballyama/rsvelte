<script>
	import Card from './Card.svelte';

	let bold = $state(false);
</script>

{#snippet plain(text)}
	<span>{text}</span>
{/snippet}

{#snippet strong(text)}
	<b>{text}</b>
{/snippet}

<Card header={bold ? strong : plain} footer={plain} />

<Card body={strong}>
	{#snippet header()}
		<h2>inline wins</h2>
	{/snippet}
	default children here
</Card>

{#each [plain, strong] as Chip}
	{@render Chip('looped')}
{/each}
