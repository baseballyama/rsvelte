<script>let items = [1, 2];</script>
<section>{#each items as i}<p class="a">{i}</p>{/each}</section>
<style>.a + .a { color: red; }</style>