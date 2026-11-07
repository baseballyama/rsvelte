<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	import MonitorCog from '@lucide/svelte/icons/monitor-cog';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';

	const items = [
		{ icon: Sun, label: 'Light', value: 's1' },
		{ icon: Moon, label: 'Dark', value: 's2' },
		{ icon: MonitorCog, label: 'System', value: 's3' }
	] as const;

	let value = $state('s1');

	const selected = $derived(items.find((i) => i.value === value));

	const uid = $props.id();
</script>

{#snippet theme(item: (typeof items)[number])}
	<item.icon size={16} aria-hidden="true" />
	<span class="truncate">{item.label}</span>
{/snippet}

<div class="space-y-2">
	<Label for={uid}>Options with icon</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger
			id={uid}
			class="[&>span_svg]:text-muted-foreground/80 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
		>
			{#if selected}
				{@render theme(selected)}
			{:else}
				Select a theme
			{/if}
		</Select.Trigger>
		<Select.Content
			class="[&_*[data-select-item]>span>svg]:text-muted-foreground/80 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:gap-2 [&_*[data-select-item]>span>svg]:shrink-0"
		>
			{#each items as item (item.value)}
				<Select.Item value={item.value}>
					{@render theme(item)}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
