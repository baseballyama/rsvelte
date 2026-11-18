<script lang="ts">
	interface Selection {
		node: unknown;
	}

	let { editor }: { editor: any } = $props();

	function selected() {
		const direct = editor?.state.selection.node;
		return direct || (editor?.state.selection as Selection).node;
	}
</script>

<p>{selected()}</p>
