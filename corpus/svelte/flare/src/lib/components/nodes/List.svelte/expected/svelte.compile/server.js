import * as $ from 'svelte/internal/server';
import ListItem from './ListItem.svelte';
import ListSection from './ListSection.svelte';
import { _useBaseView } from '$lib/views/base.svelte';
import { useTypedNode } from '$lib/node.svelte';
import BaseList from '$lib/components/BaseList.svelte';

export default function List($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { nodeId, uiTree, onSelect, searchText } = $$props;

		const $$d = $.derived(useTypedNode(() => ({ nodeId, uiTree, type: 'List' }))),
			listProps = $.derived(() => $$d().props);

		const view = _useBaseView(
			() => ({
				nodeId,
				uiTree,
				onSelect,
				searchText,
				filtering: listProps()?.filtering,
				onSearchTextChange: !!listProps()?.onSearchTextChange
			}),
			'List.Item'
		);

		const listData = $.derived(() => view.flatList);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex h-full flex-col"><div class="flex-grow">`);

			{
				function itemSnippet($$renderer, { item, isSelected, onclick }) {
					if (item.type === 'header') {
						$$renderer.push('<!--[0-->');
						ListSection($$renderer, { props: item.props });
					} else if (item.type === 'item') {
						$$renderer.push('<!--[1-->');
						ListItem($$renderer, { props: item.props, selected: isSelected, onclick });
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				BaseList($$renderer, {
					items: listData(),
					isItemSelectable: (item) => item.type === 'item',
					onenter: () => {},
					get selectedIndex() {
						return view.selectedItemIndex;
					},

					set selectedIndex($$value) {
						view.selectedItemIndex = $$value;
						$$settled = false;
					},
					itemSnippet,
					$$slots: { itemSnippet: true }
				});
			}

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}