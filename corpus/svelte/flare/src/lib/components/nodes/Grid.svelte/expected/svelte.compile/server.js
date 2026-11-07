import * as $ from 'svelte/internal/server';
import GridSection from './GridSection.svelte';
import GridItem from './GridItem.svelte';
import { useGridView } from '$lib/views';
import { useTypedNode } from '$lib/node.svelte';
import { VList } from 'virtua/svelte';
import NodeRenderer from '../NodeRenderer.svelte';
import { Loader2 } from '@lucide/svelte';

export default function Grid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onSelect, onDispatch, searchText } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: 'Grid' }))),
			gridProps = $.derived(() => $$d().props);

		const view = useGridView(() => ({
			nodeId,
			uiTree,
			onSelect,
			gridProps: gridProps(),
			searchText,
			onDispatch: (handlerName, args) => onDispatch(nodeId, handlerName, args)
		}));

		let vlist = null;
		const showEmptyView = $.derived(() => !gridProps()?.isLoading && view.allItems.length === 0 && !!view.emptyViewNodeId);

		$$renderer.push(`<div class="flex h-full flex-col"><div class="grow overflow-y-auto px-4">`);

		if (showEmptyView()) {
			$$renderer.push('<!--[0-->');
			NodeRenderer($$renderer, { nodeId: view.emptyViewNodeId, uiTree, onDispatch });
		} else if (gridProps()?.isLoading && view.allItems.length === 0) {
			$$renderer.push(`<!--[1--><div class="flex h-full items-center justify-center">`);
			Loader2($$renderer, { class: 'size-6 animate-spin text-gray-500' });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			{
				function children($$renderer, item) {
					$$renderer.push(`<div class="h-2"></div> `);

					if (item.type === 'header') {
						$$renderer.push('<!--[0-->');
						GridSection($$renderer, { props: item.props });
					} else if (item.type === 'row') {
						$$renderer.push('<!--[1-->');

						const { columns, ...styling } = item.styling;

						$$renderer.push(`<div class="grid content-start gap-x-2.5"${$.attr_style('', { 'grid-template-columns': `repeat(${columns}, 1fr)` })}><!--[-->`);

						const each_array = $.ensure_array_like(item.items);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let gridItem = each_array[$$index];
							const flatIndex = view.allItems.findIndex((f) => f.id === gridItem.id);

							$$renderer.push(`<div${$.attr('id', `item-${$.stringify(gridItem.id)}`)}>`);

							GridItem($$renderer, {
								props: gridItem.props,
								selected: view.selectedIndex === flatIndex,
								onclick: () => view.setSelectedIndex(flatIndex),
								inset: styling.inset,
								fit: styling.fit,
								aspectRatio: styling.aspectRatio
							});

							$$renderer.push(`<!----></div>`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else if (item.type === 'placeholder') {
						$$renderer.push(`<!--[2--><div class="aspect-square w-full animate-pulse rounded-md bg-white/5"></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				VList($$renderer, {
					data: view.virtualListItems,
					getKey: (item) => item.id,
					class: 'h-full',
					onscroll: view.onScroll,
					children,
					$$slots: { default: true }
				});
			}
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}