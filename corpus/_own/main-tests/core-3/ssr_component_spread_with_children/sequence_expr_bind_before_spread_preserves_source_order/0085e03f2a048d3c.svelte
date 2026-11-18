<script>
import Child from "./C.svelte";
let checked = $state(false);
let onCheckedChange = (v) => (checked = v);
let rest = $state({});
</script><Child bind:checked={() => checked, onCheckedChange} {...rest} />