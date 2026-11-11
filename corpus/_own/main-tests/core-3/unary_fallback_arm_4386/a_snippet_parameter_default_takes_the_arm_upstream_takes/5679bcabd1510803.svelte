<script>let x = 1; let f = () => 1; let o = { k: 1 };</script>
{#snippet s(p = o.k)}<span>{p}</span>{/snippet}
{@render s()}