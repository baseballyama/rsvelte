<script>
import Widget from './Widget.svelte';
let a = $state(false);
let b = $state(0);
function setA(v) { a = v; }
function setB(v) { b = v; }
</script>
<Widget bind:alpha={() => a, setA} bind:beta={() => b, setB} />