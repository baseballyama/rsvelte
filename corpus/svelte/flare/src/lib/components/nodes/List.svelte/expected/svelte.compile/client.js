import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ListItem from './ListItem.svelte';
import ListSection from './ListSection.svelte';
import { _useBaseView } from '$lib/views/base.svelte';
import { useTypedNode } from '$lib/node.svelte';
import BaseList from '$lib/components/BaseList.svelte';

var root = $.from_html(`<div class="flex h-full flex-col"><div class="flex-grow"><!></div></div>`);

export default function List($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({ nodeId: $$props.nodeId, uiTree: $$props.uiTree, type: 'List' }))),
		listProps = $.derived(() => $.get($$d).props);

	const view = _useBaseView(
		() => ({
			nodeId: $$props.nodeId,
			uiTree: $$props.uiTree,
			onSelect: $$props.onSelect,
			searchText: $$props.searchText,
			filtering: $.get(listProps)?.filtering,
			onSearchTextChange: !!$.get(listProps)?.onSearchTextChange
		}),
		'List.Item'
	);

	const listData = $.derived(() => view.flatList);
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		const itemSnippet = ($$anchor, $$arg0) => {
			let item = () => ($$arg0?.()).item;
			let isSelected = () => ($$arg0?.()).isSelected;
			let onclick = () => ($$arg0?.()).onclick;
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					ListSection($$anchor, {
						get props() {
							return item().props;
						}
					});
				};

				var consequent_1 = ($$anchor) => {
					ListItem($$anchor, {
						get props() {
							return item().props;
						},

						get selected() {
							return isSelected();
						},

						get onclick() {
							return onclick();
						}
					});
				};

				$.if(node_1, ($$render) => {
					if (item().type === 'header') $$render(consequent); else if (item().type === 'item') $$render(consequent_1, 1);
				});
			}

			$.append($$anchor, fragment);
		};

		BaseList(node, {
			get items() {
				return $.get(listData);
			},
			isItemSelectable: (item) => item.type === 'item',
			onenter: () => {},
			get selectedIndex() {
				return view.selectedItemIndex;
			},

			set selectedIndex($$value) {
				view.selectedItemIndex = $$value;
			},
			itemSnippet,
			$$slots: { itemSnippet: true }
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}