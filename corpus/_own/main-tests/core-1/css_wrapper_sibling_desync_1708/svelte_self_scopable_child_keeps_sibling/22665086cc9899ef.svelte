<script>let items = [1, 2]; let cond = true;</script>
{#if cond}<svelte:self><b class="x"></b></svelte:self>{/if}
<section>{#each items as i}<p class="a">{i}</p>{/each}</section>
<style>.a + .a { color: red; }</style>