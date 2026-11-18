<script lang="ts">
  let u: string | number
  let m: Map<string, number>
  let n = 1;
  function go() { n = 2; u = 'a'; m = new Map() }
</script>

<p on:click={go}>{n}{u}{m}</p>
