<script lang="ts">
import { readable as mapped_import } from "svelte/store";
let { nested: { mapped_binding }, ...mapped_rest } = {} as any;
export { mapped_binding };
</script>
<p>{mapped_binding}{mapped_rest}{mapped_import}</p>