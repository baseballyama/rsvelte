<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	const items = [
		{ class: 'text-emerald-600', label: 'Completed', value: 's1' },
		{ class: 'text-blue-500', label: 'In Progress', value: 's2' },
		{ class: 'text-amber-500', label: 'Pending', value: 's3' },
		{ class: 'text-gray-500', label: 'Cancelled', value: 's4' },
		{ class: 'text-red-500', label: 'Failed', value: 's5' }
	] as const;

	let value = $state('s1');

	const selected = $derived(items.find((i) => i.value === value));

	const uid = $props.id();
</script>

{#snippet status(item: (typeof items)[number])}
	<span class="flex items-center gap-2">
		<svg
			width="8"
			height="8"
			fill="currentColor"
			viewBox="0 0 8 8"
			xmlns="http://www.w3.org/2000/svg"
			class={item.class}
			aria-hidden="true"
		>
			<circle cx="4" cy="4" r="4" />
		</svg>
		<span class="truncate">{item.label}</span>
	</span>
{/snippet}

<div class="space-y-2">
	<Label for={uid}>Status select</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger
			id={uid}
			class="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
		>
			{#if selected}
				{@render status(selected)}
			{:else}
				Select a status
			{/if}
		</Select.Trigger>
		<Select.Content
			class="[&_*[data-select-item]>span>svg]:text-muted-foreground/80 [&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:items-center [&_*[data-select-item]>span]:gap-2 [&_*[data-select-item]>span>svg]:shrink-0"
		>
			{#each items as item (item.value)}
				<Select.Item value={item.value}>
					{@render status(item)}
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
