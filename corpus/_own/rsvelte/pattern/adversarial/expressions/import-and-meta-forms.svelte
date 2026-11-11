<script module>
  import * as everything from "svelte";
  import { onMount as mounted } from "svelte";
  import defaultImport, { tick } from "svelte";

  export const url = import.meta.url;

  export async function lazy() {
    return import("svelte/store");
  }
</script>

<script>
  let loaded = $state(null);

  mounted(async () => {
    loaded = await lazy();
    await tick();
  });
</script>

<b>{typeof everything}{typeof defaultImport}</b>
<b>{url.length}{loaded ? 1 : 0}</b>
