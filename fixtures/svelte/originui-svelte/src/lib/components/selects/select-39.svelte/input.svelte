<script lang="ts">
	import Label from '$lib/components/ui/label.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { cn } from '$lib/utils.js';

	const items = [
		{ class: 'bg-indigo-400/20 text-indigo-500', name: 'Frank Morris', value: 's1' },
		{ class: 'bg-purple-400/20 text-purple-500', name: 'Xavier Guerra', value: 's2' },
		{ class: 'bg-rose-400/20 text-rose-500', name: 'Anne Kelley', value: 's3' }
	] as const;

	let value = $state('s1');

	const selected = $derived(items.find((i) => i.value === value));

	const uid = $props.id();
</script>

{#snippet user(item: (typeof items)[number])}
	<span
		data-square
		class={cn(
			'bg-muted text-muted-foreground flex size-5 items-center justify-center rounded text-xs font-medium',
			item.class
		)}
		aria-hidden="true"
	>
		{item.name.charAt(0)}
	</span>
	<span class="truncate">{item.name}</span>
{/snippet}

<div class="space-y-2">
	<Label for={uid}>Options with placeholder avatar</Label>
	<Select.Root type="single" bind:value>
		<Select.Trigger
			id={uid}
			class={cn(
				'[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_img]:shrink-0',
				selected && 'ps-2'
			)}
		>
			{#if selected}
				{@render user(selected)}
			{:else}
				Select a user
			{/if}
		</Select.Trigger>
		<Select.Content
			class="[&_*[data-select-item]]:ps-2 [&_*[data-select-item]]:pe-8 [&_*[data-select-item]>span]:start-auto [&_*[data-select-item]>span]:end-2 [&_*[data-select-item]>span]:flex [&_*[data-select-item]>span]:items-center [&_*[data-select-item]>span]:gap-2"
		>
			<Select.Group>
				<Select.GroupHeading class="ps-2">Impersonate user</Select.GroupHeading>
				{#each items as item (item.value)}
					<Select.Item value={item.value}>
						{@render user(item)}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
	</Select.Root>
</div>
