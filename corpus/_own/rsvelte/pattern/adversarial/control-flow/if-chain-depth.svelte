<script>
  let n = $state(4);
</script>

{#if n === 0}
  <b>0</b>
{:else if n === 1}
  <b>1</b>
{:else if n === 2}
  <b>2</b>
{:else if n === 3}
  <b>3</b>
{:else if n === 4}
  <b>4</b>
{:else if n === 5}
  <b>5</b>
{:else if n === 6}
  <b>6</b>
{:else}
  <b>other</b>
{/if}

{#if n}{#if n}{#if n}{#if n}{#if n}<b>deep</b>{/if}{/if}{/if}{/if}{/if}
