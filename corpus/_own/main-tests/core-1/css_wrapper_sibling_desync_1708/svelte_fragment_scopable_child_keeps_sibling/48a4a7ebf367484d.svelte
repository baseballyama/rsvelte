<script>let items = [1, 2]; let cond = true;</script>
<Comp><svelte:fragment slot="s"><b class="x"></b></svelte:fragment></Comp>
<section>{#each items as i}<p class="a">{i}</p>{/each}</section>
<style>.a + .a { color: red; }</style>