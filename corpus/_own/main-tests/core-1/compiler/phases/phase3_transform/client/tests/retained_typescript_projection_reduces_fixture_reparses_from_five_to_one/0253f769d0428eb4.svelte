<script lang="ts">
	let count = $state<number | null>(0);
</script>
<button onclick={() => { count = count! + 1; }}>{count}</button>