import * as $ from 'svelte/internal/server';
import ExtensionListItem from './ExtensionListItem.svelte';
import { extensionsStore } from './store.svelte';
import BaseList from '$lib/components/BaseList.svelte';

export default function ExtensionListView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items, onSelect, onScroll, vlistInstance = void 0 } = $$props;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (extensionsStore.error) {
				$$renderer.push(`<!--[0--><div class="flex h-full items-center justify-center text-red-500">Error: ${$.escape(extensionsStore.error)}</div>`);
			} else if (items.length === 0) {
				$$renderer.push('<!--[1-->');

				if (!extensionsStore.isSearching) {
					$$renderer.push(`<!--[0--><div class="text-muted-foreground flex h-full items-center justify-center">`);

					if (extensionsStore.searchText) {
						$$renderer.push(`<!--[0-->No results for "${$.escape(extensionsStore.searchText)}"`);
					} else if (extensionsStore.selectedCategory !== 'All Categories') {
						$$renderer.push(`<!--[1-->No extensions found in this category.`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');

				{
					function itemSnippet($$renderer, { item, isSelected, onclick }) {
						if (item.itemType === 'header') {
							$$renderer.push(`<!--[0--><h3 class="text-muted-foreground px-4 pt-2.5 pb-1 text-xs font-semibold uppercase">${$.escape(item.data)}</h3>`);
						} else if (item.itemType === 'item') {
							$$renderer.push('<!--[1-->');
							ExtensionListItem($$renderer, { ext: item.data, isSelected, onclick });
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					}

					BaseList($$renderer, {
						items,
						onenter: (item) => onSelect(item.data),
						isItemSelectable: (item) => item.itemType === 'item',
						onscroll: onScroll,
						get selectedIndex() {
							return extensionsStore.selectedIndex;
						},

						set selectedIndex($$value) {
							extensionsStore.selectedIndex = $$value;
							$$settled = false;
						},

						get vlistInstance() {
							return vlistInstance;
						},

						set vlistInstance($$value) {
							vlistInstance = $$value;
							$$settled = false;
						},
						itemSnippet,
						$$slots: { itemSnippet: true }
					});
				}
			}

			$$renderer.push(`<!--]--> `);

			if (!extensionsStore.searchText && extensionsStore.isFetchingMore) {
				$$renderer.push(`<!--[0--><div class="text-muted-foreground flex h-10 items-center justify-center">Loading more...</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { vlistInstance });
	});
}