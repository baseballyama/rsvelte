<script lang="ts">
	import Editor from './Editor.svelte';

	// Keep a source location on the root identifier while lowering the member chain.
	export let questionData = { options: [{ label: '' }] };
	let index = 0;
</script>

<Editor bind:value={questionData.options[index].label} />
