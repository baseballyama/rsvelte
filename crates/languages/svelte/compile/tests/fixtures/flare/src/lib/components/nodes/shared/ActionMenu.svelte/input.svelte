<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';
	import KeyboardShortcut from '$lib/components/KeyboardShortcut.svelte';
	import { focusManager } from '$lib/focus.svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
	let open = $state(false);
	const scopeId = `action-menu-${crypto.randomUUID()}`;

	$effect(() => {
		if (open) {
			focusManager.requestFocus(scopeId);
		} else {
			focusManager.releaseFocus(scopeId);
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger data-testid="action-menu-trigger">
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="action">
				Actions
				<KeyboardShortcut shortcut={{ key: 'k', modifiers: ['cmd'] }} />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-80">
		{@render children()}
	</DropdownMenu.Content>
</DropdownMenu.Root>
