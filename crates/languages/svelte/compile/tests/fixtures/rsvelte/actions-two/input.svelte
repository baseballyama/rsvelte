<script lang="ts">
	function first(node: HTMLElement) {
		node.focus();
	}
	function second(node: HTMLElement, value: number) {
		node.tabIndex = value;
	}
</script>

<input use:first use:second={1} />
<input use:second={'x'} />
