<script lang="ts">
	let count = $state(0);
	function f() { count!++; --count!; count! += 1; count! = 3; }
</script>
<button onclick={f}>{count}</button>