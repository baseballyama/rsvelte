<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import LoadingIndicator from '../LoadingIndicator.svelte';
	import Icon from '../Icon.svelte';

	type Props = {
		showBackButton?: boolean;
		isLoading?: boolean;
		onPopView?: () => void;
		children: Snippet;
		actions?: Snippet;
	};

	let { showBackButton = false, isLoading = false, onPopView, children, actions }: Props = $props();

	const handleKeydown = (event: KeyboardEvent) => {
		if (
			event.key === 'Escape' &&
			!event.defaultPrevented &&
			!event.altKey &&
			!event.ctrlKey &&
			!event.metaKey
		) {
			if (
				event.target instanceof HTMLElement &&
				event.target.closest('[data-dropdown-menu-content]')
			) {
				// the user has a dropdown open, we want to close the dropdown instead of going back
				return;
			}

			if (onPopView) {
				event.preventDefault();
				onPopView();
			}
		}
	};
</script>

<svelte:document onkeydown={handleKeydown} />

<header class="relative flex h-15 shrink-0 items-center border-b pr-4 pl-[18px]">
	{#if showBackButton}
		<Button size="icon" onclick={onPopView} variant="secondary" class="size-6">
			<Icon icon="arrow-left-16" />
		</Button>
	{/if}

	<div class="flex flex-grow items-center">
		{@render children()}
	</div>

	{#if actions}
		<div class="ml-2 flex items-center">
			{@render actions()}
		</div>
	{/if}

	<LoadingIndicator {isLoading} />
</header>
