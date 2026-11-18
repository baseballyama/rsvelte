<script lang="ts">
	export let value: string | null = null; // trailing prop comment

	function clear() {
		value = null;
	}
</script>

<button onclick={clear}>{value}</button>
