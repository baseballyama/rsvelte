<script>let y = "s"; let act = () => {}; let flip = () => {};</script>
{#each [1] as it (it)}<p animate:flip={{ k: <string>y }}>x</p>{/each}
