import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Layout, Typography } from '@appwrite.io/pink-svelte';
import PaginationInline from './paginationInline.svelte';
import Limit from './limit.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'items',
	'limit',
	'hideFooter',
	'hidePages',
	'hasLimit',
	'name',
	'gap',
	'offset',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Paginator($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => []),
		limit = $.prop($$props, 'limit', 15, 5),
		hideFooter = $.prop($$props, 'hideFooter', 3, false),
		hidePages = $.prop($$props, 'hidePages', 3, true),
		hasLimit = $.prop($$props, 'hasLimit', 3, false),
		name = $.prop($$props, 'name', 3, 'items'),
		gap = $.prop($$props, 'gap', 3, 's'),
		offset = $.prop($$props, 'offset', 15, 0),
		restProps = $.rest_props($$props, rest_excludes);

	let total = $.derived(() => items().length);
	let paginatedItems = $.derived(() => items().slice(offset(), offset() + limit()));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, $.spread_props(
			{
				get gap() {
					return gap();
				}
			},
			() => restProps,
			{
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					$.snippet(node_1, () => $$props.children, () => $.get(paginatedItems), limit);

					var node_2 = $.sibling(node_1, 2);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
								Layout_Stack_1($$anchor, {
									direction: 'row',
									justifyContent: 'space-between',
									alignItems: 'center',
									wrap: 'wrap',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_4 = $.first_child(fragment_3);

										{
											var consequent = ($$anchor) => {
												Limit($$anchor, {
													get sum() {
														return $.get(total);
													},

													get name() {
														return name();
													},

													get limit() {
														return limit();
													},

													set limit($$value) {
														limit($$value);
													}
												});
											};

											var alternate = ($$anchor) => {
												var fragment_5 = $.comment();
												var node_5 = $.first_child(fragment_5);

												$.component(node_5, () => Typography.Text, ($$anchor, Typography_Text) => {
													Typography_Text($$anchor, {
														variant: 'm-400',
														color: '--fgcolor-neutral-secondary',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text = $.text();

															$.template_effect(() => $.set_text(text, `Total results: ${$.get(total) ?? ''}`));
															$.append($$anchor, text);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											};

											$.if(node_4, ($$render) => {
												if (hasLimit()) $$render(consequent); else $$render(alternate, -1);
											});
										}

										var node_6 = $.sibling(node_4, 2);

										PaginationInline(node_6, {
											get limit() {
												return limit();
											},

											get total() {
												return $.get(total);
											},

											get hidePages() {
												return hidePages();
											},

											get offset() {
												return offset();
											},

											set offset($$value) {
												offset($$value);
											}
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						};

						$.if(node_2, ($$render) => {
							if (!hideFooter()) $$render(consequent_1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	});

	$.append($$anchor, fragment);
	$.pop();
}