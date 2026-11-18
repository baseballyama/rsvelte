<script>let promise = Promise.resolve(1);</script>
{#await promise}{:then _}<div class="a"></div><div class="b"></div>{/await}
<style>:global(.a) + .b { color: red; }</style>