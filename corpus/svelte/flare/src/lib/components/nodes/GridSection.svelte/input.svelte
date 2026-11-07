<script lang="ts">
	import type { GridSectionProps } from '$lib/props';

	type Props = {
		props: GridSectionProps;
	};

	let { props }: Props = $props();
</script>

<div class="col-start-1 -col-end-1 -mb-1 flex items-baseline gap-2 pt-2.5">
	<h3 class="text-xs font-semibold text-gray-500 uppercase">
		{props.title}
	</h3>
	{#if props.subtitle}
		<p class="text-muted-foreground truncate text-xs">{props.subtitle}</p>
	{/if}
</div>
