<script lang="ts">
	let count = $state(0);
	function f() { count!++; }
</script>
<button onclick={f}>{count}</button>