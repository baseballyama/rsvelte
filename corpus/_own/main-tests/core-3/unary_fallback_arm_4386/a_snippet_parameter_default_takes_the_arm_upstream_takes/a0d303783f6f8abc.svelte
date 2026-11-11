<script>let x = 1; let f = () => 1; let o = { k: 1 };</script>
{#snippet s(p = x || 1)}<span>{p}</span>{/snippet}
{@render s()}