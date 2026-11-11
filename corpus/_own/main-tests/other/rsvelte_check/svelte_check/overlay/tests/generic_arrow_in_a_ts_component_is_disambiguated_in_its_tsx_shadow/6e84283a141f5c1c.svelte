<script lang="ts">
  const totalsBy = <K>(pick: (n: number) => K) => pick(1);
</script>
<p>{totalsBy(String)}</p>
