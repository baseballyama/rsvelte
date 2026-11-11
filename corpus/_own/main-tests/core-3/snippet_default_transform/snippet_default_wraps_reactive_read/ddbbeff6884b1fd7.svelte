<script>let count = $state(5);</script>
<button onclick={() => count++}>{count}</button>
{#snippet foo(x = count)}{x}{/snippet}
{@render foo()}