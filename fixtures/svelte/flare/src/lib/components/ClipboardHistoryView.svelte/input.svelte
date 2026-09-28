<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import { onMount, tick, untrack } from 'svelte';
	import { VList } from 'virtua/svelte';
	import { Loader2 } from '@lucide/svelte';
	import ListItemBase from './nodes/shared/ListItemBase.svelte';
	import { convertFileSrc } from '@tauri-apps/api/core';
	import { writeText } from '@tauri-apps/plugin-clipboard-manager';
	import * as Select from './ui/select';
	import ActionBar from './nodes/shared/ActionBar.svelte';
	import BaseList from './BaseList.svelte';
	import HeaderInput from './HeaderInput.svelte';
	import MainLayout from './layout/MainLayout.svelte';
	import Header from './layout/Header.svelte';
	import InfoList from './InfoList.svelte';
	import type { ActionDefinition } from './nodes/shared/actions';
	import clipboardHistoryCommandIcon from '$lib/assets/command-clipboard-history-1616x16@2x.png?inline';

	type Props = {
		onBack: () => void;
	};

	type ClipboardItem = {
		id: number;
		hash: string;
		contentType: 'text' | 'image' | 'color' | 'link' | 'file';
		contentValue: string | null;
		preview: string | null;
		contentSizeBytes: number;
		sourceAppName: string | null;
		firstCopiedAt: string;
		lastCopiedAt: string;
		timesCopied: number;
		isPinned: boolean;
	};

	type DisplayItem = {
		id: number | string;
		itemType: 'item' | 'header';
		data: ClipboardItem | string;
	};

	let { onBack }: Props = $props();

	let allItems = $state<ClipboardItem[]>([]);
	let selectedIndex = $state(0);
	let searchText = $state('');
	let filter = $state('all');
	let listContainerEl = $state<HTMLElement | null>(null);
	let isInitialMount = $state(true);

	let currentPage = $state(0);
	let hasMore = $state(true);
	let isFetching = $state(false);

	let selectedItemContent = $state<string | null>(null);
	let virtualizedLines = $state<string[]>([]);
	let isContentLoading = $state(false);

	const displayedItems = $derived.by(() => {
		const items: DisplayItem[] = [];
		const pinned = allItems.filter((item) => item.isPinned);
		const recent = allItems.filter((item) => !item.isPinned);

		if (pinned.length > 0) {
			items.push({ id: 'header-pinned', itemType: 'header', data: 'Pinned' });
			pinned.forEach((item) => items.push({ id: item.id, itemType: 'item', data: item }));
		}
		if (recent.length > 0) {
			items.push({ id: 'header-recent', itemType: 'header', data: 'Most Recent' });
			recent.forEach((item) => items.push({ id: item.id, itemType: 'item', data: item }));
		}
		return items;
	});

	const selectedItem = $derived(
		displayedItems[selectedIndex]?.itemType === 'item'
			? (displayedItems[selectedIndex].data as ClipboardItem)
			: null
	);

	const iconMap = new Map<ClipboardItem['contentType'], string>([
		['text', 'text-16'],
		['image', 'image-16'],
		['color', 'swatch-16'],
		['link', 'link-16'],
		['file', 'blank-document-16']
	]);

	const PAGE_SIZE = 50;

	const loadMoreItems = async () => {
		if (isFetching || !hasMore) return;
		isFetching = true;
		try {
			const newItems = await invoke<ClipboardItem[]>('history_get_items', {
				filter,
				limit: PAGE_SIZE,
				offset: currentPage * PAGE_SIZE,
				searchTerm: searchText || null
			});
			if (newItems.length < PAGE_SIZE) hasMore = false;
			allItems = currentPage === 0 ? newItems : [...allItems, ...newItems];
			currentPage += 1;
		} catch (e) {
			console.error('Failed to fetch clipboard history:', e);
		} finally {
			isFetching = false;
		}
	};

	const resetAndFetch = () => {
		allItems = [];
		currentPage = 0;
		hasMore = true;
		if (isFetching) return;
		selectedIndex = 0;
		tick().then(loadMoreItems);
	};

	const formatDateTime = (dateString: string) =>
		`Today at ${new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

	const handleCopy = async (item: ClipboardItem) => {
		const content =
			item.contentValue ?? (await invoke<string>('history_get_item_content', { id: item.id }));
		await writeText(content);
		await invoke('history_item_was_copied', { id: item.id });
		const updatedItems = allItems.map((i) =>
			i.id === item.id ? { ...i, timesCopied: i.timesCopied + 1 } : i
		);
		allItems = updatedItems;
	};

	const handlePin = async (item: ClipboardItem) => {
		await invoke('history_toggle_pin', { id: item.id });
		resetAndFetch();
	};

	const handleDelete = async (item: ClipboardItem) => {
		await invoke('history_delete_item', { id: item.id });
		resetAndFetch();
	};

	onMount(() => {
		const container = listContainerEl;
		if (!container) return;
		const onScroll = () => {
			if (
				container.scrollHeight > container.clientHeight &&
				container.scrollHeight - container.scrollTop - container.clientHeight < 200
			) {
				loadMoreItems();
			}
		};
		container.addEventListener('scroll', onScroll);
		resetAndFetch();
		isInitialMount = false;
		return () => container.removeEventListener('scroll', onScroll);
	});

	$effect(() => {
		[searchText, filter];
		if (isInitialMount) return;

		untrack(() => {
			resetAndFetch();
		});
	});

	$effect(() => {
		const item = selectedItem;
		virtualizedLines = [];
		selectedItemContent = null;
		if (!item) return;

		const processContent = async () => {
			if (item.contentValue !== null) {
				selectedItemContent = item.contentValue;
				isContentLoading = false;
				return;
			}

			isContentLoading = true;
			try {
				const fullContent = await invoke<string>('history_get_item_content', { id: item.id });

				if (selectedItem?.id !== item.id) return;

				if (item.contentType === 'text' && item.contentSizeBytes > 10000) {
					selectedItemContent = fullContent;
					await tick();
					virtualizedLines = fullContent.split('\n');
				} else {
					selectedItemContent = fullContent;
				}
			} catch (err) {
				console.error('Failed to load content', err);
				if (selectedItem?.id === item.id) selectedItemContent = 'Error: Could not load content.';
			} finally {
				if (selectedItem?.id === item.id) isContentLoading = false;
			}
		};

		processContent();
	});

	const actions: ActionDefinition[] = $derived(
		selectedItem
			? [
					{
						title: 'Copy to Clipboard',
						handler: () => handleCopy(selectedItem)
					},
					{
						title: selectedItem.isPinned ? 'Unpin' : 'Pin',
						shortcut: { key: 'P', modifiers: ['cmd', 'shift'] },
						handler: () => handlePin(selectedItem)
					},
					{
						title: 'Delete',
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
				placeholder="Type to filter entries..."
				bind:value={searchText}
				autofocus
				class="!pl-2.5"
			/>
			{#snippet actions()}
				<Select.Root bind:value={filter} type="single">
					<Select.Trigger class="w-32">
						{filter === 'all'
							? 'All Types'
							: filter.charAt(0).toUpperCase() + filter.slice(1) + 's'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="all">All Types</Select.Item>
						<Select.Item value="text">Text</Select.Item>
						<Select.Item value="image">Images</Select.Item>
						<Select.Item value="link">Links</Select.Item>
						<Select.Item value="color">Colors</Select.Item>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Header>
	{/snippet}
	{#snippet content()}
		<div class="grid grow grid-cols-[minmax(0,_1.5fr)_minmax(0,_2.5fr)] overflow-y-hidden">
			<div class="flex-grow overflow-y-auto border-r" bind:this={listContainerEl}>
				<BaseList
					items={displayedItems}
					bind:selectedIndex
					onenter={(item) => handleCopy(item.data as ClipboardItem)}
					isItemSelectable={(item) => item.itemType === 'item'}
				>
					{#snippet itemSnippet({ item, isSelected, onclick: itemOnClick })}
						{#if item.itemType === 'header'}
							<h3 class="text-muted-foreground px-4 pt-2.5 pb-1 text-xs font-semibold uppercase">
								{item.data as string}
							</h3>
						{:else if item.itemType === 'item'}
							{@const clipboardItem = item.data as ClipboardItem}
							<button class="w-full" onclick={itemOnClick}>
								<ListItemBase
									icon={iconMap.get(clipboardItem.contentType) ?? 'question-mark-circle-16'}
									title={clipboardItem.preview ?? clipboardItem.contentValue ?? ''}
									{isSelected}
								/>
							</button>
						{/if}
					{/snippet}
				</BaseList>
				{#if isFetching && allItems.length > 0}
					<div class="text-muted-foreground flex h-10 items-center justify-center">
						<Loader2 class="size-4 animate-spin" />
					</div>
				{/if}
			</div>
			<div class="flex flex-col overflow-y-hidden">
				{#if selectedItem}
					<div class="relative flex-grow overflow-y-auto p-4">
						{#if isContentLoading}
							<div
								class="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm"
							>
								<Loader2 class="text-muted-foreground size-6 animate-spin" />
							</div>
						{/if}

						{#if selectedItemContent}
							{#if selectedItem.contentType === 'color'}
								<div class="flex flex-col items-center justify-center gap-4 py-8">
									<div
										class="size-24 rounded-full border"
										style:background-color={selectedItemContent}
									></div>
									<p class="font-mono text-lg">{selectedItemContent}</p>
								</div>
							{:else if selectedItem.contentType === 'image'}
								<img
									src={convertFileSrc(selectedItemContent)}
									alt="Clipboard content"
									class="mx-auto max-h-full max-w-full rounded-lg object-contain"
								/>
							{:else if virtualizedLines.length > 0}
								<div class="h-full font-mono text-sm">
									<VList data={virtualizedLines}>
										{#snippet children(item)}
											<div class="whitespace-pre">{item}</div>
										{/snippet}
									</VList>
								</div>
							{:else if selectedItem.contentType === 'text'}
								<div class="rounded bg-black/10 p-4 font-mono text-sm whitespace-pre-wrap">
									{selectedItemContent}
								</div>
							{/if}
						{/if}
					</div>

					<InfoList
						title="Information"
						items={[
							{ label: 'Application', value: selectedItem.sourceAppName ?? 'Unknown' },
							{
								label: 'Content type',
								value:
									selectedItem.contentType.charAt(0).toUpperCase() +
									selectedItem.contentType.slice(1)
							},
							{ label: 'Times copied', value: selectedItem.timesCopied },
							{ label: 'Last copied', value: formatDateTime(selectedItem.lastCopiedAt) },
							{ label: 'First copied', value: formatDateTime(selectedItem.firstCopiedAt) }
						]}
					/>
				{/if}
			</div>
		</div>
	{/snippet}

	{#snippet footer()}
		{#if selectedItem}
			<ActionBar {actions} icon={clipboardHistoryCommandIcon} title="Clipboard History" />
		{/if}
	{/snippet}
</MainLayout>
