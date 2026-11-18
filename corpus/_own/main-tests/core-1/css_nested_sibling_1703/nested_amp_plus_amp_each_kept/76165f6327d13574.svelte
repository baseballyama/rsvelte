<script>let items = [1, 2];</script>
{#each items as i}<p class="a">{i}</p>{/each}
<style>.a { & + & { color: red; } }</style>