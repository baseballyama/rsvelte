import type { UINode } from '$lib/types';
import {
	GridItemPropsSchema,
	ListItemPropsSchema,
	ViewSectionPropsSchema,
	type GridItemProps,
	type ListItemProps,
	type ViewSectionProps
} from '$lib/props';
import Fuse from 'fuse.js';

export type FlatViewItem = { id: number } & (
	| { type: 'header'; props: ViewSectionProps }
	| { type: 'item'; props: ListItemProps | GridItemProps }
);

export type BaseViewArgs = {
	nodeId: number;
	uiTree: Map<number, UINode>;
	onSelect: (nodeId: number | undefined) => void;
	searchText?: string;
	filtering?: boolean;
	onSearchTextChange?: boolean;
};

function filterItems(items: FlatViewItem[], searchText: string): FlatViewItem[] {
	const fuse = new Fuse(items, {
		keys: [
			{ name: 'props.title', weight: 0.7 },
			{ name: 'props.subtitle', weight: 0.5 },
			{ name: 'props.keywords', weight: 0.3 }
		],
		threshold: 0.4
	});
	return fuse.search(searchText).map((result) => result.item);
}

export function _useBaseView(args: () => BaseViewArgs, itemType: 'List.Item' | 'Grid.Item') {
	const { nodeId, uiTree, searchText, filtering, onSearchTextChange } = $derived.by(args);

	const isFilteringEnabled = $derived(
		filtering === true || (filtering !== false && !onSearchTextChange)
	);

	let flatList = $state<FlatViewItem[]>([]);
	let selectedItemIndex = $state(-1);

	$effect(() => {
		const root = uiTree.get(nodeId);
		if (!root) {
			flatList = [];
			return;
		}

		const newFlatList: FlatViewItem[] = [];
		const itemSchema = itemType === 'List.Item' ? ListItemPropsSchema : GridItemPropsSchema;
		const sectionType = itemType === 'List.Item' ? 'List.Section' : 'Grid.Section';

		const directItems: FlatViewItem[] = [];

		for (const childId of root.children) {
			const childNode = uiTree.get(childId);
			if (!childNode) continue;

			if (childNode.type === sectionType) {
				const sectionResult = ViewSectionPropsSchema.safeParse(childNode.props);
				if (!sectionResult.success) continue;

				const sectionItems: FlatViewItem[] = [];
				for (const itemId of childNode.children) {
					const itemNode = uiTree.get(itemId);
					if (itemNode && itemNode.type === itemType) {
						const itemResult = itemSchema.safeParse(itemNode.props);
						if (!itemResult.success) continue;

						sectionItems.push({ id: itemNode.id, type: 'item', props: itemResult.data });
					}
				}

				const itemsToShow =
					isFilteringEnabled && searchText && searchText.trim() !== ''
						? filterItems(sectionItems, searchText)
						: sectionItems;

				if (itemsToShow.length > 0) {
					newFlatList.push({ id: childNode.id, type: 'header', props: sectionResult.data });
					newFlatList.push(...itemsToShow);
				}
			} else if (childNode.type === itemType) {
				const itemResult = itemSchema.safeParse(childNode.props);
				if (itemResult.success) {
					directItems.push({ id: childNode.id, type: 'item', props: itemResult.data });
				}
			}
		}

		if (directItems.length > 0) {
			const itemsToShow =
				isFilteringEnabled && searchText && searchText.trim() !== ''
					? filterItems(directItems, searchText)
					: directItems;

			if (itemsToShow.length > 0) {
				const defaultSectionProps = { title: undefined };
				newFlatList.unshift({ id: -1, type: 'header', props: defaultSectionProps }, ...itemsToShow);
			}
		}

		flatList = newFlatList;
	});

	$effect(() => {
		const currentItem = flatList[selectedItemIndex];
		if (currentItem?.type === 'item') return;
		selectedItemIndex = flatList.findIndex((item) => item.type === 'item');
	});

	const { onSelect } = $derived.by(args);
	$effect(() => {
		const selectedItem = flatList[selectedItemIndex];
		onSelect(selectedItem?.type === 'item' ? selectedItem.id : undefined);
	});

	return {
		get flatList() {
			return flatList;
		},
		get selectedItemIndex() {
			return selectedItemIndex;
		},
		set selectedItemIndex(index: number) {
			if (flatList[index]?.type === 'item') {
				selectedItemIndex = index;
			}
		}
	};
}
