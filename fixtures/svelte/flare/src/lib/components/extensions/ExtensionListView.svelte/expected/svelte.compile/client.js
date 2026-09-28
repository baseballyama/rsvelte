import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ExtensionListItem from './ExtensionListItem.svelte';
import { extensionsStore } from './store.svelte';
import BaseList from '$lib/components/BaseList.svelte';

var root = $.from_html(`<div class="flex h-full items-center justify-center text-red-500"> </div>`);
var root_1 = $.from_html(`<div class="text-muted-foreground flex h-full items-center justify-center"><!></div>`);
var root_2 = $.from_html(`<h3 class="text-muted-foreground px-4 pt-2.5 pb-1 text-xs font-semibold uppercase"> </h3>`);
var root_3 = $.from_html(`<div class="text-muted-foreground flex h-10 items-center justify-center">Loading more...</div>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function ExtensionListView($$anchor, $$props) {
	$.push($$props, true);

	let vlistInstance = $.prop($$props, 'vlistInstance', 15);
	var fragment = root_4();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var text = $.only_child(div);

			$.template_effect(() => $.set_text(text, `Error: ${extensionsStore.error ?? ''}`));
			$.append($$anchor, div);
		};

		var consequent_4 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_3 = ($$anchor) => {
					var div_1 = root_1();
					var node_2 = $.child(div_1);

					{
						var consequent_1 = ($$anchor) => {
							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, `No results for "${extensionsStore.searchText ?? ''}"`));
							$.append($$anchor, text_1);
						};

						var consequent_2 = ($$anchor) => {
							var text_2 = $.text('No extensions found in this category.');

							$.append($$anchor, text_2);
						};

						$.if(node_2, ($$render) => {
							if (extensionsStore.searchText) $$render(consequent_1); else if (extensionsStore.selectedCategory !== 'All Categories') $$render(consequent_2, 1);
						});
					}

					$.reset(div_1);
					$.append($$anchor, div_1);
				};

				$.if(node_1, ($$render) => {
					if (!extensionsStore.isSearching) $$render(consequent_3);
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			{
				const itemSnippet = ($$anchor, $$arg0) => {
					let item = () => ($$arg0?.()).item;
					let isSelected = () => ($$arg0?.()).isSelected;
					let onclick = () => ($$arg0?.()).onclick;
					var fragment_4 = $.comment();
					var node_3 = $.first_child(fragment_4);

					{
						var consequent_5 = ($$anchor) => {
							var h3 = root_2();
							var text_3 = $.only_child(h3, true);

							$.template_effect(() => $.set_text(text_3, item().data));
							$.append($$anchor, h3);
						};

						var consequent_6 = ($$anchor) => {
							ExtensionListItem($$anchor, {
								get ext() {
									return item().data;
								},

								get isSelected() {
									return isSelected();
								},

								get onclick() {
									return onclick();
								}
							});
						};

						$.if(node_3, ($$render) => {
							if (item().itemType === 'header') $$render(consequent_5); else if (item().itemType === 'item') $$render(consequent_6, 1);
						});
					}

					$.append($$anchor, fragment_4);
				};

				BaseList($$anchor, {
					get items() {
						return $$props.items;
					},
					onenter: (item) => $$props.onSelect(item.data),
					isItemSelectable: (item) => item.itemType === 'item',
					get onscroll() {
						return $$props.onScroll;
					},

					get selectedIndex() {
						return extensionsStore.selectedIndex;
					},

					set selectedIndex($$value) {
						extensionsStore.selectedIndex = $$value;
					},

					get vlistInstance() {
						return vlistInstance();
					},

					set vlistInstance($$value) {
						vlistInstance($$value);
					},
					itemSnippet,
					$$slots: { itemSnippet: true }
				});
			}
		};

		$.if(node, ($$render) => {
			if (extensionsStore.error) $$render(consequent); else if ($$props.items.length === 0) $$render(consequent_4, 1); else $$render(alternate, -1);
		});
	}

	var node_4 = $.sibling(node, 2);

	{
		var consequent_7 = ($$anchor) => {
			var div_2 = root_3();

			$.append($$anchor, div_2);
		};

		$.if(node_4, ($$render) => {
			if (!extensionsStore.searchText && extensionsStore.isFetchingMore) $$render(consequent_7);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}