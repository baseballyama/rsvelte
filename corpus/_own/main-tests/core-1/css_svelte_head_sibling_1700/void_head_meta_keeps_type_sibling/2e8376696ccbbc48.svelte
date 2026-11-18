<script>let items = [1, 2];</script>
<svelte:head><meta name="viewport" content="x" /></svelte:head>
<section>{#each items as i}<p class="a">{i}</p>{/each}</section>
<style>p + p { color: red; }</style>