<script lang="ts">
interface Props { initial: number }
let count: number = $state<number>(0);
</script>

<button onclick={() => count++}>{count}</button>
