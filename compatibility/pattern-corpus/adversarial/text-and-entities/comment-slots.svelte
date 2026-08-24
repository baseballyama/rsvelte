<!-- leading comment -->
<script>
  // line comment
  /* block comment */
  /** jsdoc comment */
  let n = $state(1); // trailing
</script>

<!-- before an element -->
<div>
  <!-- inside an element -->
  text
  <!-- between text and an expression -->
  {n}
  <!-- after an expression -->
</div>

{#if n}
  <!-- inside an if -->
  <b>{n}</b>
{:else}
  <!-- inside an else -->
  <b>0</b>
{/if}

{#each [n] as row}
  <!-- inside an each -->
  <b>{row}</b>
{/each}

<b>{/* comment in an expression */ n}</b>
<b>{n}</b>

<!-- trailing comment -->

<style>
  /* a css comment */
  b {
    /* a declaration comment */
    color: red;
  }
</style>
