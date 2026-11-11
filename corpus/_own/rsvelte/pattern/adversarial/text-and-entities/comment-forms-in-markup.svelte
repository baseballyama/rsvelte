<!-- a leading document comment -->
<script>
  // a line comment
  /* a block comment */
  let v = $state(1);
</script>

<!-- before an element -->
<div>
  <!-- inside an element -->
  {v}
  <!-- after an expression -->
</div>

{#if v}
  <!-- inside a block -->
  <b>{v}</b>
{/if}

{#each [v] as item}
  <!-- inside an each -->
  <b>{item}</b>
{/each}

<!--
	a multi-line
	comment
-->
<!---->
<!-- a trailing document comment -->
