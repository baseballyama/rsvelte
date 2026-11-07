<script lang="ts">
	type InfoItem = {
		label: string;
		value: string | number;
	};

	type Props = {
		title: string;
		items: InfoItem[];
	};

	let { title, items }: Props = $props();
</script>

<div class="h-[150px] shrink-0 overflow-y-auto border-t p-4">
	<h3 class="text-muted-foreground mb-2 text-xs font-semibold uppercase">{title}</h3>
	<div class="flex flex-col gap-3 text-sm">
		{#each items as item (item.label)}
			<div class="flex justify-between">
				<span class="text-muted-foreground">{item.label}</span>
				<span>{item.value}</span>
			</div>
		{/each}
	</div>
</div>
