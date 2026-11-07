<script lang="ts">
	import type { UINode } from '$lib/types';
	import { useTypedNode } from '$lib/node.svelte';
	import { setContext, untrack, getContext } from 'svelte';
	import { ChevronsUpDownIcon } from '@lucide/svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import NodeRenderer from '$lib/components/NodeRenderer.svelte';
	import { getDropdownItems } from '$lib/components/nodes/shared/dropdown';
	import { focusManager } from '$lib/focus.svelte';
	import { imperativeBus } from '$lib/imperative.svelte';

	type Props = {
		nodeId: number;
		uiTree: Map<number, UINode>;
		onDispatch: (instanceId: number, handlerName: string, args: unknown[]) => void;
	};

	let { nodeId, uiTree, onDispatch }: Props = $props();

	const { node, props: componentProps } = $derived.by(
		useTypedNode(() => ({ nodeId, uiTree, type: 'Form.Dropdown' }))
	);
	const { register } = getContext<{ register: (id: string, value: unknown) => void }>(
		'form-context'
	);

	const isControlled = $derived(componentProps?.value !== undefined);
	const dropdownItems = $derived.by(() => (node ? getDropdownItems(node, uiTree) : []));
	const itemsMap = $derived.by(() => new Map(dropdownItems.map((i) => [i.value, i])));
	const firstItemValue = $derived.by(() => dropdownItems[0]?.value);

	let internalValue = $state<string | undefined>();
	let mounted = $state(false);
	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);
	const scopeId = `form-dropdown-${nodeId}`;

	const displayValue = $derived(isControlled ? componentProps?.value : internalValue);
	const selectedItem = $derived(itemsMap.get(displayValue ?? ''));

	$effect(() => {
		if (componentProps) {
			register(componentProps.id!, displayValue);
		}
	});

	$effect(() => {
		if (open) {
			focusManager.requestFocus(scopeId);
		} else {
			focusManager.releaseFocus(scopeId);
		}
	});

	$effect(() => {
		if (componentProps?.value !== undefined && componentProps.value !== internalValue) {
			internalValue = componentProps.value ?? undefined;
		}
	});

	$effect(() => {
		if (!mounted) {
			if (!isControlled) {
				internalValue = componentProps?.defaultValue;
			}
			if (internalValue === undefined && firstItemValue !== undefined) {
				onDispatch(nodeId, 'onChange', [firstItemValue]);
				if (!isControlled) {
					internalValue = firstItemValue;
				}
			}
			mounted = true;
		} else {
			if (internalValue !== componentProps?.value) {
				if (internalValue !== undefined) {
					onDispatch(nodeId, 'onChange', [internalValue]);
				}
			}
		}
	});

	$effect(() => {
		const cmd = imperativeBus.command;
		if (cmd && cmd.nodeId === nodeId) {
			if (cmd.command === 'focus') {
				triggerRef?.focus();
			} else if (cmd.command === 'reset') {
				if (!untrack(() => isControlled)) {
					internalValue = untrack(() => componentProps?.defaultValue);
				}
			}
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
	<div class="flex gap-4">
		<label
			for={componentProps.id}
			class="text-muted-foreground pt-2 text-right text-sm font-medium"
		>
			{componentProps.title}
		</label>
		<div class="w-full">
			<Popover.Root bind:open>
				<Popover.Trigger bind:ref={triggerRef}>
					{#snippet child({ props: popoverTriggerProps })}
						<Button
							{...popoverTriggerProps}
							variant="outline"
							class="w-full justify-between"
							role="combobox"
							aria-expanded={open}
						>
							{selectedItem?.title || componentProps.placeholder || 'Select option...'}
							<ChevronsUpDownIcon class="opacity-50" />
						</Button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-full p-0">
					<Command.Root>
						{#if componentProps.filtering !== false}
							<Command.Input placeholder="Search..." />
						{/if}
						<Command.List>
							<Command.Empty>No option found.</Command.Empty>
							{#each node.children as childId (childId)}
								<NodeRenderer nodeId={childId} {uiTree} {onDispatch} />
							{/each}
						</Command.List>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
			{#if componentProps.error}
				<p class="mt-1 text-xs text-red-600">{componentProps.error}</p>
			{/if}
			{#if componentProps.info}
				<p class="mt-1 text-xs text-gray-500">{componentProps.info}</p>
			{/if}
		</div>
	</div>
{/if}
