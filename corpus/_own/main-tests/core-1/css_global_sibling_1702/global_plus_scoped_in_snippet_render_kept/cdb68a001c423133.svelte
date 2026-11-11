{#snippet s()}<div class="a"></div><div class="b"></div>{/snippet}
{@render s()}
<style>:global(.a) + .b { color: red; }</style>