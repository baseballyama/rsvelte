<svelte:options preserveWhitespace />
<script>let count = $state(0);</script>
<div>  first  <span>{count}</span>  last  </div>
<button onclick={() => count++}>  update  </button>
