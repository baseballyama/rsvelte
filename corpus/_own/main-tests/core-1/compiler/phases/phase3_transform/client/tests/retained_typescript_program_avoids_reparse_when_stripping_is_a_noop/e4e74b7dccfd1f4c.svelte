<script lang="ts">
let count = $state(0);
const read = () => count;
</script>

<button onclick={() => count++}>{read()}</button>
