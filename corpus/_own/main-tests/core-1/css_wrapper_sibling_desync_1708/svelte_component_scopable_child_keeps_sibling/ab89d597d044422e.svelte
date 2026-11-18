<script>let items = [1, 2]; let cond = true;</script>
<svelte:component this={cond}><b class="x"></b></svelte:component>
<section>{#each items as i}<p class="a">{i}</p>{/each}</section>
<style>.a + .a { color: red; }</style>