<script lang="ts">
let count: number = $state(0);
function increment() { count!++; }
</script>

<button onclick={increment}>{count}</button>
