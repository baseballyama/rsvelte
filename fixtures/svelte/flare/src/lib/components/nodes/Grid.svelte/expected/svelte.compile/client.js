import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GridSection from './GridSection.svelte';
import GridItem from './GridItem.svelte';
import { useGridView } from '$lib/views';
import { useTypedNode } from '$lib/node.svelte';
import { VList } from 'virtua/svelte';
import NodeRenderer from '../NodeRenderer.svelte';
import { Loader2 } from '@lucide/svelte';

var root = $.from_html(`<div class="flex h-full items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<div class="grid content-start gap-x-2.5"></div>`);
var root_3 = $.from_html(`<div class="aspect-square w-full animate-pulse rounded-md bg-white/5"></div>`);
var root_4 = $.from_html(`<div class="h-2"></div> <!>`, 1);
var root_5 = $.from_html(`<div class="flex h-full flex-col"><div class="grow overflow-y-auto px-4"><!></div></div>`);

export default function Grid($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(useTypedNode(() => ({ nodeId: $$props.nodeId, uiTree: $$props.uiTree, type: 'Grid' }))),
		gridProps = $.derived(() => $.get($$d).props);

	const view = useGridView(() => ({
		nodeId: $$props.nodeId,
		uiTree: $$props.uiTree,
		onSelect: $$props.onSelect,
		gridProps: $.get(gridProps),
		searchText: $$props.searchText,
		onDispatch: (handlerName, args) => $$props.onDispatch($$props.nodeId, handlerName, args)
	}));

	let vlist = $.state(null);

	$.user_effect(() => {
		view.vlistInstance = $.get(vlist) ?? undefined;
	});

	const showEmptyView = $.derived(() => !$.get(gridProps)?.isLoading && view.allItems.length === 0 && !!view.emptyViewNodeId);
	var div = root_5();

	$.event('keydown', $.window, function (...$$args) {
		view.handleKeydown?.apply(this, $$args);
	});

	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			NodeRenderer($$anchor, {
				get nodeId() {
					return view.emptyViewNodeId;
				},

				get uiTree() {
					return $$props.uiTree;
				},

				get onDispatch() {
					return $$props.onDispatch;
				}
			});
		};

		var consequent_1 = ($$anchor) => {
			var div_2 = root();
			var node_1 = $.child(div_2);

			Loader2(node_1, { class: 'size-6 animate-spin text-gray-500' });
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		var alternate = ($$anchor) => {
			{
				const children = ($$anchor, item = $.noop) => {
					var fragment_2 = root_4();
					var node_2 = $.sibling($.first_child(fragment_2), 2);

					{
						var consequent_2 = ($$anchor) => {
							GridSection($$anchor, {
								get props() {
									return item().props;
								}
							});
						};

						var consequent_3 = ($$anchor) => {
							const computed_const = $.derived(() => {
								const { columns, ...styling } = item().styling;

								return { columns, styling };
							});

							var div_3 = root_2();
							let styles;

							$.each(div_3, 21, () => item().items, (gridItem) => gridItem.id, ($$anchor, gridItem) => {
								const flatIndex = $.derived(() => view.allItems.findIndex((f) => f.id === $.get(gridItem).id));
								var div_4 = root_1();
								var node_3 = $.child(div_4);

								{
									let $0 = $.derived(() => view.selectedIndex === $.get(flatIndex));

									GridItem(node_3, {
										get props() {
											return $.get(gridItem).props;
										},

										get selected() {
											return $.get($0);
										},
										onclick: () => view.setSelectedIndex($.get(flatIndex)),
										get inset() {
											return $.get(computed_const).styling.inset;
										},

										get fit() {
											return $.get(computed_const).styling.fit;
										},

										get aspectRatio() {
											return $.get(computed_const).styling.aspectRatio;
										}
									});
								}

								$.reset(div_4);
								$.template_effect(() => $.set_attribute(div_4, 'id', `item-${$.get(gridItem).id ?? ''}`));
								$.append($$anchor, div_4);
							});

							$.reset(div_3);

							$.template_effect(() => styles = $.set_style(div_3, '', styles, {
								'grid-template-columns': `repeat(${$.get(computed_const).columns}, 1fr)`
							}));

							$.append($$anchor, div_3);
						};

						var consequent_4 = ($$anchor) => {
							var div_5 = root_3();

							$.append($$anchor, div_5);
						};

						$.if(node_2, ($$render) => {
							if (item().type === 'header') $$render(consequent_2); else if (item().type === 'row') $$render(consequent_3, 1); else if (item().type === 'placeholder') $$render(consequent_4, 2);
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.bind_this(
					VList($$anchor, {
						get data() {
							return view.virtualListItems;
						},
						getKey: (item) => item.id,
						class: 'h-full',
						get onscroll() {
							return view.onScroll;
						},
						children,
						$$slots: { default: true }
					}),
					($$value) => $.set(vlist, $$value, true),
					() => $.get(vlist)
				);
			}
		};

		$.if(node, ($$render) => {
			if ($.get(showEmptyView)) $$render(consequent); else if ($.get(gridProps)?.isLoading && view.allItems.length === 0) $$render(consequent_1, 1); else $$render(alternate, -1);
		});
	}

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}