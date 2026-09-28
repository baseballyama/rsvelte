<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import { tick, untrack } from 'svelte';
	import { Loader2, Folder, File } from '@lucide/svelte';
	import ListItemBase from './nodes/shared/ListItemBase.svelte';
	import { writeText } from '@tauri-apps/plugin-clipboard-manager';
	import ActionBar from './nodes/shared/ActionBar.svelte';
	import BaseList from './BaseList.svelte';
	import { open } from '@tauri-apps/plugin-shell';
	import { focusManager } from '$lib/focus.svelte';
	import HeaderInput from './HeaderInput.svelte';
	import MainLayout from './layout/MainLayout.svelte';
	import Header from './layout/Header.svelte';
	import InfoList from './InfoList.svelte';
	import type { ActionDefinition } from './nodes/shared/actions';
	import fileSearchCommandIcon from '$lib/assets/command-file-search-1616x16@2x.png?inline';

	type Props = {
		onBack: () => void;
	};

	type IndexedFile = {
		path: string;
		name: string;
		parentPath: string;
		fileType: 'file' | 'directory';
		lastModified: number; // unix timestamp
	};

	let { onBack }: Props = $props();

	let searchResults = $state<IndexedFile[]>([]);
	let selectedIndex = $state(0);
	let searchText = $state('');
	let isFetching = $state(false);
	let searchInputEl: HTMLInputElement | null = $state(null);

	const selectedItem = $derived(searchResults[selectedIndex]);

	$effect(() => {
		if (focusManager.activeScope === 'main-input') {
			tick().then(() => {
				searchInputEl?.focus();
			});
		}
	});

	const fetchFiles = async () => {
		if (isFetching) return;
		isFetching = true;
		try {
			const newItems = await invoke<IndexedFile[]>('search_files', {
				term: searchText
			});
			searchResults = newItems;
			if (selectedIndex >= newItems.length) {
				selectedIndex = 0;
			}
		} catch (e) {
			console.error('Failed to fetch files:', e);
		} finally {
			isFetching = false;
		}
	};

	const formatDateTime = (timestamp: number) => {
		const date = new Date(timestamp * 1000);
		if (date.getFullYear() < 1971) return 'N/A';
		return date.toLocaleString();
	};

	const handleOpen = async (item: IndexedFile) => {
		await open(item.path);
		onBack();
	};

	const handleShow = async (item: IndexedFile) => {
		await invoke('show_in_finder', { path: item.path });
	};

	const handleCopyPath = async (item: IndexedFile) => {
		await writeText(item.path);
	};

	const handleDelete = async (item: IndexedFile) => {
		await invoke('trash', { paths: [item.path] });
		fetchFiles();
	};

	$effect(() => {
		const term = searchText;
		if (!term) {
			searchResults = [];
			isFetching = false;
			return;
		}

		untrack(() => {
			const timer = setTimeout(() => {
				if (term === searchText) {
					fetchFiles();
				}
			}, 200);
			return () => clearTimeout(timer);
		});
	});

	const actions: ActionDefinition[] = $derived(
		selectedItem
			? [
					{
						title: 'Open',
						handler: () => handleOpen(selectedItem)
					},
					{
						title: 'Show in File Manager',
						shortcut: { key: 'Enter', modifiers: ['cmd'] },
						handler: () => handleShow(selectedItem)
					},
					{
						title: 'Copy Path',
						shortcut: { key: 'c', modifiers: ['ctrl'] },
						handler: () => handleCopyPath(selectedItem)
					},
					{
						title: 'Move to Trash',
						shortcut: { key: 'x', modifiers: ['ctrl'] },
						handler: () => handleDelete(selectedItem)
					}
				]
			: []
	);
</script>

<MainLayout>
	{#snippet header()}
		<Header showBackButton={true} onPopView={onBack}>
			<HeaderInput
				placeholder="Search for files and folders..."
				bind:value={searchText}
				bind:ref={searchInputEl}
				autofocus
				class="!pl-2.5"
			/>
		</Header>
	{/snippet}
	{#snippet content()}
		<div class="grid grow grid-cols-[minmax(0,_1.5fr)_minmax(0,_2.5fr)] overflow-y-hidden">
			<div class="flex-grow overflow-y-auto border-r">
				{#if isFetching && searchResults.length === 0}
					<div class="text-muted-foreground flex h-full items-center justify-center">
						<Loader2 class="size-6 animate-spin" />
					</div>
				{/if}
				<BaseList
					items={searchResults.map((item) => ({ ...item, id: item.path }))}
					bind:selectedIndex
					onenter={(item) => handleOpen(item)}
				>
					{#snippet itemSnippet({ item, isSelected, onclick })}
						<button class="w-full text-left" {onclick}>
							<ListItemBase
								icon={item.fileType === 'directory' ? 'folder-16' : 'blank-document-16'}
								title={item.name}
								subtitle={item.parentPath}
								{isSelected}
							/>
						</button>
					{/snippet}
				</BaseList>
			</div>
			<div class="flex flex-col overflow-y-hidden">
				{#if selectedItem}
					<div class="flex h-full flex-col items-center justify-center p-4">
						<div class="mb-4">
							{#if selectedItem.fileType === 'directory'}
								<Folder class="size-24 text-gray-500" />
							{:else}
								<File class="size-24 text-gray-500" />
							{/if}
						</div>
						<p class="text-xl font-semibold">{selectedItem.name}</p>
						<p class="text-muted-foreground text-sm">{selectedItem.path}</p>
					</div>

					<InfoList
						title="Information"
						items={[
							{
								label: 'Type',
								value:
									selectedItem.fileType.charAt(0).toUpperCase() + selectedItem.fileType.slice(1)
							},
							{ label: 'Last Modified', value: formatDateTime(selectedItem.lastModified) }
						]}
					/>
				{/if}
			</div>
		</div>
	{/snippet}

	{#snippet footer()}
		{#if selectedItem}
			<ActionBar {actions} icon={fileSearchCommandIcon} title="Search Files" />
		{/if}
	{/snippet}
</MainLayout>
