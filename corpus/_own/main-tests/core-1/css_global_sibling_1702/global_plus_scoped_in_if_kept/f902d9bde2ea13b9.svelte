<script>let cond = true;</script>
{#if cond}<div class="a"></div><div class="b"></div>{/if}
<style>:global(.a) + .b { color: red; }</style>