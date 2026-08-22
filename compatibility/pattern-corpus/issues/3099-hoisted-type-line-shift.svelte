<script lang="ts">
	interface Props {
		x?: number;
	}

	let { x }: Props = $props();

	export type Exported = { n: number };

	let n = $state(0);
</script>

<p>{x}{n}</p>
