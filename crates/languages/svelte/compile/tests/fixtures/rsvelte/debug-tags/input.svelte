<script>let x = $state(1); let y = 2; let o = $state({a: 1});</script>
{@debug x, y}
{@debug}
{#if x}{@debug o}{/if}
<button onclick={() => x++}>{x}</button>
