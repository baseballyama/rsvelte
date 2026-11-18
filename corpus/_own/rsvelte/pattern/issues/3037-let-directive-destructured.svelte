<script>
	import List from './List.svelte';

	export let rows = [];
</script>

<List {rows} let:item let:index>
	<span>{index}:{item}</span>
</List>

<List {rows} let:item={{ id, name }}>
	<span slot="row" let:cell={[first, ...others]}>{first}{others.length}</span>
	<b>{id}:{name}</b>
</List>

<List {rows}>
	<svelte:fragment let:summary>
		<p>{summary}</p>
	</svelte:fragment>
</List>
