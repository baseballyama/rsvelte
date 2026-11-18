<script>
	import Inner from './List.svelte';

	let data = $state({ hosts: [{ type: 'a' }] });
	const norm = (v) => ({ v });
</script>

{#each data.hosts as host, index (index)}
	<Inner onValueChange={(v) => (host.type = norm(v))} />

	<div>
		<Inner onValueChange={(v) => (host.type = norm(v))} />
		<Inner onValueChange={[(v) => (host.type = norm(v))]} />
	</div>
{/each}
