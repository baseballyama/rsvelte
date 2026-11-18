<script>let count=1+2</script>
<button on:click={() =>count++} class:active={count >5}>
{ count +3 }
</button>
{#each Array.from({length:count}) as item}<li>{ item }</li>{/each}