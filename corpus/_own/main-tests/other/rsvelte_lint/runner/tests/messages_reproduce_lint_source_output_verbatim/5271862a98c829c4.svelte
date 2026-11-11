<script>
  let a;
  a = 1;
</script>
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html a}
<img src="x.png" />
{#each items as item}{item}{/each}
<p>{'foo'}</p>
{@debug a}
