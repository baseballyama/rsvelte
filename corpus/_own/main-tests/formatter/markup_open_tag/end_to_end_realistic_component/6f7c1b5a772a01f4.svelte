<script>let count=0</script>
<button  on:click={() =>count++}  class:active={count >0}  disabled={count > 10}>
{count}
</button>