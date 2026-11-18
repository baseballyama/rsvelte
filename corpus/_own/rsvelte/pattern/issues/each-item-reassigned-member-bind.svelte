<script>
	import Editor from './Editor.svelte';

	export let issues = [];
</script>

{#each issues as issue, index (issue.id)}
	<Editor bind:value={issue.kind} />
	<Editor bind:value={issue[index]} />
	<Editor bind:value={issue} />
{/each}
