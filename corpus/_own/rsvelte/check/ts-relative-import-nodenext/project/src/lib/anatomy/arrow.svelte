<script module lang="ts">
	export interface ArrowProps {
		size: number;
	}
</script>

<script lang="ts">
	let { size }: ArrowProps = $props();
</script>

<span>{size}</span>
