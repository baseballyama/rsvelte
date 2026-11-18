<script>
import Checkbox from './Checkbox.svelte';
let checked = $state(false);
function onCheckedChange(v) { checked = v; }
</script>
<Checkbox bind:checked={() => checked, onCheckedChange} />