<script lang="ts">
	import { setContext, tick } from 'svelte';
	import MainLayout from '$lib/components/layout/MainLayout.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Content from '$lib/components/layout/Content.svelte';
	import { uiStore } from '$lib/ui.svelte';
	import path from 'path';
	import ActionBar from './nodes/shared/ActionBar.svelte';
	import NodeRenderer from './NodeRenderer.svelte';
	import { focusManager } from '$lib/focus.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { sidecarService } from '$lib/sidecar.svelte';
	import HeaderInput from './HeaderInput.svelte';
	import { nodeToActionDefinition } from './nodes/shared/actions';

	const { uiTree, rootNodeId, selectedNodeId, toasts, currentRunningPlugin, allActions } =
		$derived(uiStore);

	type Props = {
		onPopView: () => void;
		onToastAction: (toastId: number, actionType: 'primary' | 'secondary') => void;
	};

	let { onPopView, onToastAction }: Props = $props();

	const rootNode = $derived(uiTree.get(rootNodeId!));
	const selectedItemNode = $derived(uiTree.get(selectedNodeId!));
	let searchText = $state('');
	let searchInputEl: HTMLInputElement | null = $state(null);
	const icon = $derived(currentRunningPlugin?.icon);
	const navigationTitle = $derived(
		(rootNode?.props.navigationTitle as string | undefined) ?? currentRunningPlugin?.title
	);
	const toastToShow = $derived(Array.from(toasts.entries()).sort((a, b) => b[0] - a[0])[0]?.[1]);
	const formValues = new SvelteMap<string, unknown>();

	const assetsPath = $derived(
		currentRunningPlugin ? path.dirname(currentRunningPlugin.pluginPath) + '/assets' : ''
	);
	setContext('assetsPath', () => assetsPath);
	setContext('form-context', {
		register: (fieldId: string, value: unknown) => {
			formValues.set(fieldId, value);
		}
	});

	function handleSelect(nodeId: number | undefined) {
		uiStore.selectedNodeId = nodeId;
	}

	function handleDispatch(instanceId: number, handlerName: string, args: unknown[]) {
		const instance = uiTree.get(instanceId);
		if (instance?.type === 'Action.SubmitForm' && handlerName === 'onSubmit') {
			const valuesObject = Object.fromEntries(formValues.entries());
			sidecarService.dispatchEvent('dispatch-event', {
				instanceId,
				handlerName,
				args: [valuesObject]
			});
			formValues.clear();
		} else {
			sidecarService.dispatchEvent('dispatch-event', { instanceId, handlerName, args });
		}
	}

	$effect(() => {
		if (focusManager.activeScope === 'main-input') {
			tick().then(() => {
				searchInputEl?.focus();
			});
		}
	});

	$effect(() => {
		if (rootNode) {
			handleDispatch(rootNode.id, 'onSearchTextChange', [searchText]);
		}
	});
</script>

{#if rootNode}
	<MainLayout>
		{#snippet header()}
			<Header
				showBackButton={true}
				isLoading={(rootNode?.props.isLoading as boolean) ?? false}
				{onPopView}
			>
				{#if rootNode.type === 'List' || rootNode.type === 'Grid'}
					<HeaderInput
						placeholder={(rootNode.props.searchBarPlaceholder as string) ?? 'Search...'}
						bind:value={searchText}
						bind:ref={searchInputEl}
						autofocus
						class="!pl-2.5"
					/>
				{:else if rootNode.type === 'Form'}
					<div class="grow"></div>
				{/if}
				{#snippet actions()}
					{@const searchBarAccessoryId = rootNode?.namedChildren?.searchBarAccessory}
					{#if searchBarAccessoryId && (rootNode.type === 'List' || rootNode.type === 'Grid' || rootNode.type === 'Form')}
						{#key searchBarAccessoryId}
							<NodeRenderer nodeId={searchBarAccessoryId} {uiTree} onDispatch={handleDispatch} />
						{/key}
					{/if}
				{/snippet}
			</Header>
		{/snippet}

		{#snippet content()}
			<Content
				{rootNode}
				{selectedItemNode}
				{uiTree}
				onDispatch={handleDispatch}
				onSelect={handleSelect}
				{searchText}
			/>
		{/snippet}

		{#snippet footer()}
			<ActionBar
				actions={allActions.map((node) => nodeToActionDefinition(node, handleDispatch))}
				{icon}
				title={navigationTitle}
				toast={toastToShow}
				{onToastAction}
			/>
		{/snippet}
	</MainLayout>
{/if}
