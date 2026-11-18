{#snippet shown()}<span>a</span>{/snippet}
{#snippet orphan()}<b>b</b>{/snippet}
<div class="wrap">{@render shown()}</div>
<style>
	.wrap span { color: red; }
	.wrap b { color: green; }
</style>
