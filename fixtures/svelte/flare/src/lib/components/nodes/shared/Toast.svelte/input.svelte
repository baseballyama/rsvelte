<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { Toast } from '$lib/ui.svelte';
	import type { KeyboardShortcut as KeyboardShortcutType } from '$lib/props';
	import KeyboardShortcut from '$lib/components/KeyboardShortcut.svelte';
	import { keyEventMatches } from '$lib/props/actions';
	import { focusManager } from '$lib/focus.svelte';

	type Props = {
		toast: Toast;
		onToastAction?: (toastId: number, actionType: 'primary' | 'secondary') => void;
	};

	let { toast, onToastAction }: Props = $props();

	let open = $state(false);
	const scopeId = `toast-menu-${crypto.randomUUID()}`;

	$effect(() => {
		if (open) {
			focusManager.requestFocus(scopeId);
		} else {
			focusManager.releaseFocus(scopeId);
		}
	});

	const actions = $derived.by(() => {
		if (!toast) return [];

		const availableActions: {
			type: 'primary' | 'secondary';
			title: string;
			shortcut?: KeyboardShortcutType;
		}[] = [];

		if (toast.primaryAction) {
			availableActions.push({ type: 'primary', ...toast.primaryAction });
		}
		if (toast.secondaryAction) {
			availableActions.push({ type: 'secondary', ...toast.secondaryAction });
		}
		return availableActions;
	});

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key.toLowerCase() === 't' && (e.ctrlKey || e.metaKey)) {
			if (actions.length > 0) {
				e.preventDefault();
				open = !open;
			}
		} else if (toast?.primaryAction?.shortcut && keyEventMatches(e, toast.primaryAction.shortcut)) {
			handleActionSelect('primary');
		} else if (
			toast?.secondaryAction?.shortcut &&
			keyEventMatches(e, toast.secondaryAction.shortcut)
		) {
			handleActionSelect('secondary');
		}
	};

	const handleActionSelect = (actionType: 'primary' | 'secondary') => {
		if (onToastAction) {
			onToastAction(toast.id, actionType);
		}
		open = false;
	};
</script>

<svelte:window onkeydown={handleKeydown} />

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<div {...props} class="flex items-baseline gap-2">
				<div class="flex size-4 items-center justify-center">
					{#if toast.style === 'ANIMATED'}
						<div
							class="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
						></div>
					{:else if toast.style === 'SUCCESS'}
						<div class="shadow-glow size-2 rounded-full bg-green-500 shadow-green-500"></div>
					{:else if toast.style === 'FAILURE'}
						<div class="shadow-glow size-2 rounded-full bg-red-500 shadow-red-500"></div>
					{/if}
				</div>
				<div>
					<span>{toast.title}</span>
					<span class="text-muted-foreground text-sm">{toast.message}</span>
				</div>
				{#if toast.primaryAction || toast.secondaryAction}
					<KeyboardShortcut shortcut={{ key: 't', modifiers: ['ctrl'] }} />
				{/if}
			</div>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content side="top" align="start" class="w-60">
		<DropdownMenu.Label>Toast Actions</DropdownMenu.Label>
		<DropdownMenu.Separator />
		{#each actions as action (action.type)}
			<DropdownMenu.Item onclick={() => handleActionSelect(action.type)}>
				{action.title}
				{#if action.shortcut}
					<DropdownMenu.Shortcut>
						<KeyboardShortcut shortcut={action.shortcut} />
					</DropdownMenu.Shortcut>
				{/if}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
