<script>let x = 1; let f = () => 1; let o = { k: 1 };</script>
{#snippet s(p = function () {})}<span>{p}</span>{/snippet}
{@render s()}