<script>let { p } = $props(); let xs = $state([1]);</script>
{#each xs as v}{const c = p + v}{/each}
