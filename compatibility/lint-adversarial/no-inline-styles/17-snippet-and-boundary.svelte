{#snippet row()}
	<div style="color: red">snippet</div>
{/snippet}
{@render row()}
<svelte:boundary>
	<div style:color="red">boundary</div>
</svelte:boundary>
