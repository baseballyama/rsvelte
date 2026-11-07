<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import * as Command from '$lib/components/ui/command';
	import { ChevronsUpDown, Check } from '@lucide/svelte';
	import { extensionsStore } from './store.svelte';
	import { focusManager } from '$lib/focus.svelte';

	let categoryPopoverOpen = $state(false);
	const scopeId = `category-filter-${crypto.randomUUID()}`;

	$effect(() => {
		if (categoryPopoverOpen) {
			focusManager.requestFocus(scopeId);
		} else {
			focusManager.releaseFocus(scopeId);
		}
	});
</script>

<Popover.Root bind:open={categoryPopoverOpen}>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				variant="ghost"
				role="combobox"
				aria-expanded={categoryPopoverOpen}
				class="w-48 justify-between"
				{...props}
			>
				{extensionsStore.selectedCategory}
				<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-48 p-0">
		<Command.Root>
			<Command.Input placeholder="Search category..." />
			<Command.Empty>No category found.</Command.Empty>
			<Command.List>
				{#each extensionsStore.allCategories as category (category)}
					<Command.Item
						value={category}
						onSelect={() => {
							extensionsStore.selectedCategory = category;
							extensionsStore.selectedIndex = 0;
							categoryPopoverOpen = false;
						}}
					>
						<Check
							class={extensionsStore.selectedCategory !== category ? 'text-transparent' : ''}
						/>
						{category}
					</Command.Item>
				{/each}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
