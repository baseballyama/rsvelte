<script module lang="ts">
	export interface RowShape {
		id: string;
	}
</script>

<script lang="ts" generics="T extends RowShape">
	interface Props {
		rows: T[];
	}

	let { rows }: Props = $props();
</script>

<ul>
	{#each rows as row}
		<li>{row.id}</li>
	{/each}
</ul>
