<script lang="ts">
  let v = $state("");
</script>
<input bind:value={() => v, (nv: string) => v = nv} />
