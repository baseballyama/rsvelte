<script>let promise = Promise.resolve(1);</script>
{#await promise}{:then _}<section><div class="b"></div></section>{/await}
<style>:global(.a) + .b { color: red; }</style>