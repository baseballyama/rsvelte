<script lang="ts">
	import Editor from './Editor.svelte';

	// A bindable rune prop uses the same component setter path as a legacy prop.
	let { data = $bindable({ pingEval: '' }) } = $props();
</script>

<Editor bind:value={data.pingEval} />
