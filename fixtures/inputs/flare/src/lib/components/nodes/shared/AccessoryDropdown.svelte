<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import { setContext } from 'svelte';
	import { ChevronDown } from '@lucide/svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import NodeRenderer from '$lib/components/NodeRenderer.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { getDropdownItems } from '$lib/components/nodes/shared/dropdown';
	import type { DropdownItemProps } from '$lib/props';
	import { focusManager } from '$lib/focus.svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
	};

	let { nodeId, uiTree, onDispatch }: Props = $props();

	const { node, props: componentProps } = $derived.by(
		useTypedNode(() => ({
			nodeId,
			uiTree,
			type: ['List.Dropdown', 'Grid.Dropdown']
		}))
	);

	const isControlled = $derived(componentProps?.value !== undefined);
	const dropdownItems = $derived(node ? getDropdownItems(node, uiTree) : []);
	const itemsMap = $derived(new Map(dropdownItems.map((i: DropdownItemProps) => [i.value, i])));
	const firstItemValue = $derived(dropdownItems[0]?.value);

	let internalValue = $state<string | undefined>();
	let isInitialized = $state(false);
	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	const scopeId = `accessory-dropdown-${nodeId}`;

	const displayValue = $derived(isControlled ? componentProps?.value : internalValue);
	const selectedItem = $derived(itemsMap.get(displayValue ?? ''));

	$effect(() => {
		if (componentProps && !isInitialized) {
			const initial = componentProps.defaultValue ?? componentProps.value;
			if (initial !== undefined) {
				internalValue = initial ?? undefined;
			} else if (firstItemValue !== undefined) {
				onDispatch(nodeId, 'onChange', [firstItemValue]);
				if (!isControlled) {
					internalValue = firstItemValue;
				}
			}
			isInitialized = true;
		}
	});

	$effect(() => {
		if (isControlled && componentProps) {
			internalValue = componentProps.value ?? undefined;
		}
	});

	$effect(() => {
		if (isInitialized && !isControlled && internalValue !== undefined) {
			onDispatch(nodeId, 'onChange', [internalValue]);
		}
	});

	$effect(() => {
		if (open) {
			focusManager.requestFocus(scopeId);
		} else {
			focusManager.releaseFocus(scopeId);
		}
	});

	function onSelect(value: string) {
		if (!isControlled) {
			internalValue = value;
		}
		onDispatch(nodeId, 'onChange', [value]);
		open = false;
	}

	setContext('unified-dropdown', {
		displayValue: () => displayValue,
		onSelect
	});
</script>

{#if node && componentProps}
	<Popover.Root bind:open>
		<Popover.Trigger bind:ref={triggerRef}>
			{#snippet child({ props: popoverTriggerProps })}
				<Button
					{...popoverTriggerProps}
					variant="outline"
					class="!border-border h-9 w-64 justify-between !px-2.5"
					role="combobox"
					aria-expanded={open}
					title={componentProps.tooltip}
				>
					<div class="flex items-center gap-2">
						{#if selectedItem?.icon}
							<div class="flex size-[18px] shrink-0 items-center justify-center">
								<Icon icon={selectedItem.icon} class="size-[18px]" />
							</div>
						{/if}
						<span class="truncate text-base">
							{selectedItem?.title ?? componentProps?.placeholder ?? 'Select...'}
						</span>
					</div>
					<ChevronDown
						class="size-4 shrink-0 opacity-50 transition-transform {open ? 'rotate-180' : ''}"
					/>
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="h-[275px] w-64 p-0">
			<Command.Root>
				<Command.Input placeholder="Search..." class="h-12 text-base" />
				<Command.List class="mt-2">
					<Command.Empty>No items found.</Command.Empty>
					{#each node.children as childId (childId)}
						<NodeRenderer
							nodeId={childId}
							{uiTree}
							{onDispatch}
							selectedValue={displayValue ?? undefined}
						/>
					{/each}
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
{/if}
