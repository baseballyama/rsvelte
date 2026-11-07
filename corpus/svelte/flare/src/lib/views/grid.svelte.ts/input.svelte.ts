import { type BaseViewArgs, type FlatViewItem } from './base.svelte';
import type { GridInset, GridFit, GridSectionProps, GridItemProps, GridProps } from '$lib/props';
import { focusManager } from '$lib/focus.svelte';
import type { VListHandle } from 'virtua/svelte';
import type { UINode } from '$lib/types';
import Fuse from 'fuse.js';

type GridViewItem = FlatViewItem & {
	props: GridItemProps;
	sectionProps: GridSectionProps & GridProps;
};

export type VirtualGridItem =
	| { id: string | number; type: 'header'; props: GridSectionProps }
	| {
			id: string;
			type: 'row';
			items: GridViewItem[];
			styling: {
				columns: number;
				aspectRatio?: string;
				fit?: GridFit;
				inset?: GridInset;
			};
	  }
	| { id: number; type: 'placeholder' };

type GridViewArgs = BaseViewArgs & {
	gridProps: GridProps | null;
	onDispatch: (handlerName: string, args: unknown[]) => void;
};

function filterItems(items: GridViewItem[], searchText: string): GridViewItem[] {
	if (!searchText.trim()) return items;
	const fuse = new Fuse(items, {
		keys: ['props.title', 'props.subtitle', 'props.keywords'],
		threshold: 0.4,
		includeScore: true
	});
	return fuse.search(searchText).map((result) => result.item);
}

export function useGridView(args: () => GridViewArgs) {
	const { nodeId, uiTree, onSelect, searchText, gridProps, onDispatch } = $derived.by(args);

	const isFilteringEnabled = $derived(
		gridProps?.filtering === true ||
			(gridProps?.filtering !== false && !gridProps?.onSearchTextChange)
	);

	const { allItems, emptyViewNodeId } = $derived.by(() => {
		const root = uiTree.get(nodeId);
		const items: GridViewItem[] = [];
		let emptyViewNodeId: number | undefined;

		if (!root) return { allItems: items, emptyViewNodeId };

		const defaultSectionProps = {
			isLoading: false,
			throttle: false,
			columns: 6,
			...gridProps,
			title: undefined,
			subtitle: undefined
		};

		const processSection = (sectionNode: UINode, sectionPropsOverride?: Partial<GridProps>) => {
			const rawSectionProps = {
				...defaultSectionProps,
				...(sectionNode.props as GridSectionProps),
				...sectionPropsOverride
			};
			const currentSectionItems: GridViewItem[] = [];

			for (const itemId of sectionNode.children) {
				const itemNode = uiTree.get(itemId);
				if (itemNode?.type === 'Grid.Item') {
					currentSectionItems.push({
						id: itemNode.id,
						type: 'item',
						props: itemNode.props as GridItemProps,
						sectionProps: rawSectionProps
					});
				}
			}
			return { props: rawSectionProps, items: currentSectionItems };
		};

		const sections: ReturnType<typeof processSection>[] = [];
		const topLevelItems: UINode[] = [];

		for (const childId of root.children) {
			const childNode = uiTree.get(childId);
			if (!childNode) continue;
			if (childNode.type === 'Grid.Section') {
				sections.push(processSection(childNode));
			} else if (childNode.type === 'Grid.Item') {
				topLevelItems.push(childNode);
			} else if (childNode.type === 'Grid.EmptyView') {
				emptyViewNodeId = childNode.id;
			}
		}

		if (topLevelItems.length > 0) {
			sections.unshift(processSection({ ...root, children: topLevelItems.map((i) => i.id) }));
		}

		for (const section of sections) {
			if (isFilteringEnabled) {
				const filtered = searchText ? filterItems(section.items, searchText) : section.items;
				if (filtered.length > 0) {
					items.push(...filtered);
				}
			} else {
				items.push(...section.items);
			}
		}

		return { allItems: items, emptyViewNodeId };
	});

	let selectedIndex = $state(-1);

	const virtualListItems = $derived.by((): VirtualGridItem[] => {
		const result: VirtualGridItem[] = [];
		if (allItems.length === 0) return result;

		let lastSectionTitle: string | undefined = undefined;
		let currentRow: GridViewItem[] = [];
		let currentSectionProps: (typeof allItems)[0]['sectionProps'] | undefined;

		for (const item of allItems) {
			const itemSectionTitle = item.sectionProps.title;
			if (itemSectionTitle !== lastSectionTitle) {
				if (currentRow.length > 0 && currentSectionProps) {
					result.push({
						id: `row-${result.length}`,
						type: 'row',
						items: currentRow,
						styling: {
							columns: currentSectionProps.columns ?? 6,
							aspectRatio: currentSectionProps.aspectRatio,
							fit: currentSectionProps.fit,
							inset: currentSectionProps.inset
						}
					});
				}
				currentRow = [];
				if (itemSectionTitle) {
					result.push({
						id: `header-${itemSectionTitle}`,
						type: 'header',
						props: item.sectionProps
					});
				}
				lastSectionTitle = itemSectionTitle;
				currentSectionProps = item.sectionProps;
			}

			if (currentSectionProps) {
				currentRow.push(item);
				if (currentRow.length === (currentSectionProps.columns ?? 6)) {
					result.push({
						id: `row-${result.length}`,
						type: 'row',
						items: currentRow,
						styling: {
							columns: currentSectionProps.columns ?? 6,
							aspectRatio: currentSectionProps.aspectRatio,
							fit: currentSectionProps.fit,
							inset: currentSectionProps.inset
						}
					});
					currentRow = [];
				}
			}
		}

		if (currentRow.length > 0 && currentSectionProps) {
			result.push({
				id: `row-${result.length}`,
				type: 'row',
				items: currentRow,
				styling: {
					columns: currentSectionProps.columns ?? 6,
					aspectRatio: currentSectionProps.aspectRatio,
					fit: currentSectionProps.fit,
					inset: currentSectionProps.inset
				}
			});
		}

		if (gridProps?.pagination?.hasMore && gridProps.pagination.pageSize > 0) {
			for (let i = 0; i < gridProps.pagination.pageSize; i++) {
				result.push({ id: i, type: 'placeholder' });
			}
		}

		return result;
	});

	let vlistInstance = $state<VListHandle | undefined>();

	const gridMap: {
		flatListIndex: number;
		sectionIndex: number;
		rowIndex: number;
		colIndex: number;
	}[] = $derived.by(() => {
		const newGridMap: (typeof gridMap)[0][] = [];
		let sectionIndex = -1;
		let lastSectionTitle: string | undefined = undefined;
		let rowIndex = -1;
		let colIndex = 0;

		allItems.forEach((item, index) => {
			const itemSectionTitle = item.sectionProps.title;
			const columns = item.sectionProps.columns ?? 6;

			if (itemSectionTitle !== lastSectionTitle) {
				sectionIndex++;
				lastSectionTitle = itemSectionTitle;
				rowIndex = -1;
				colIndex = 0;
			}

			if (colIndex % columns === 0) {
				rowIndex++;
				colIndex = 0;
			}

			newGridMap.push({ flatListIndex: index, sectionIndex, rowIndex, colIndex });
			colIndex++;
		});
		return newGridMap;
	});

	$effect(() => {
		if (gridProps?.onSelectionChange) {
			onDispatch('onSelectionChange', [allItems[selectedIndex]?.props.id ?? null]);
		}
		if (allItems.length === 0 && emptyViewNodeId) {
			onSelect(emptyViewNodeId);
		} else {
			onSelect(allItems[selectedIndex]?.id);
		}
	});

	$effect(() => {
		// Programmatic selection
		const targetId = gridProps?.selectedItemId;
		if (targetId) {
			const index = allItems.findIndex((item) => item.props.id === targetId);
			if (index !== -1 && index !== selectedIndex) {
				selectedIndex = index;
			}
		} else {
			// Default selection
			if (selectedIndex < 0 && allItems.length > 0) {
				selectedIndex = 0;
			}
		}
	});

	$effect(() => {
		if (selectedIndex >= allItems.length) {
			selectedIndex = allItems.length > 0 ? 0 : -1;
		}
	});

	const handleKeydown = (event: KeyboardEvent) => {
		if (focusManager.activeScope !== 'main-input' || allItems.length === 0) {
			return;
		}

		if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
		event.preventDefault();

		const currentGridIndex = gridMap.findIndex((item) => item.flatListIndex === selectedIndex);
		if (currentGridIndex === -1) {
			if (gridMap.length > 0) selectedIndex = gridMap[0].flatListIndex;
			return;
		}

		let newIndex = -1;
		const currentPos = gridMap[currentGridIndex];

		switch (event.key) {
			case 'ArrowLeft':
				newIndex = Math.max(0, selectedIndex - 1);
				break;
			case 'ArrowRight':
				newIndex = Math.min(allItems.length - 1, selectedIndex + 1);
				break;
			case 'ArrowUp':
			case 'ArrowDown': {
				const direction = event.key === 'ArrowDown' ? 1 : -1;
				let targetRow = currentPos.rowIndex + direction;
				let targetSection = currentPos.sectionIndex;

				while (newIndex === -1) {
					const targetRowItems = gridMap.filter(
						(p) => p.sectionIndex === targetSection && p.rowIndex === targetRow
					);
					if (targetRowItems.length > 0) {
						const targetItem =
							targetRowItems.find((p) => p.colIndex === currentPos.colIndex) ??
							targetRowItems.at(-1)!;
						newIndex = targetItem.flatListIndex;
						break;
					}

					targetSection += direction;
					const sections = [...new Set(gridMap.map((p) => p.sectionIndex))].sort((a, b) => a - b);
					if (targetSection < sections[0] || targetSection > sections.at(-1)!) {
						break;
					}

					const rowsInNewSection = [
						...new Set(
							gridMap.filter((p) => p.sectionIndex === targetSection).map((p) => p.rowIndex)
						)
					].sort((a, b) => a - b);
					targetRow = direction === 1 ? rowsInNewSection[0] : rowsInNewSection.at(-1)!;
				}
				break;
			}
		}

		if (newIndex !== -1) {
			selectedIndex = newIndex;
			const virtualRow = virtualListItems.findIndex((v) => {
				if (v.type !== 'row') return false;
				return v.items.some((i) => i.id === allItems[newIndex].id);
			});
			if (virtualRow !== -1) {
				vlistInstance?.scrollToIndex(virtualRow, { align: 'nearest' });
			}
		}
	};

	const onScroll = (offset: number) => {
		if (!vlistInstance || !gridProps?.pagination || !gridProps.pagination.hasMore) return;
		if (
			vlistInstance.getScrollSize() - offset - vlistInstance.getViewportSize() < 300 &&
			gridProps.pagination.onLoadMore
		) {
			onDispatch('onLoadMore', []);
		}
	};

	return {
		get allItems() {
			return allItems;
		},
		get virtualListItems() {
			return virtualListItems;
		},
		get selectedIndex() {
			return selectedIndex;
		},
		setSelectedIndex(index: number) {
			selectedIndex = index;
		},
		get emptyViewNodeId() {
			return emptyViewNodeId;
		},
		set vlistInstance(instance: VListHandle | undefined) {
			vlistInstance = instance;
		},
		handleKeydown,
		onScroll
	};
}
