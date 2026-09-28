import 'svelte/internal/disclose-version';
import { DropdownMenu } from "bits-ui";
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<style>:root {
			scroll-padding-top: 200px;
		}</style>`);

var root_1 = $.from_html(`<div style="height: 24px;"> </div>`);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div data-testid="page"><!> <!> <!></div>`);

export default function Dropdown_menu_scroll_padding_test($$anchor, $$props) {
	let contentProps = $.prop($$props, 'contentProps', 19, () => ({}));
	const rows = Array.from({ length: 80 }, (_, i) => i + 1);
	var div = root_4();

	$.head('y9wqh5', ($$anchor) => {
		var style = root();

		$.append($$anchor, style);
	});

	var node = $.child(div);

	$.each(node, 17, () => rows, $.index, ($$anchor, row) => {
		var div_1 = root_1();
		var text = $.only_child(div_1);

		$.template_effect(() => $.set_text(text, `Row ${$.get(row) ?? ''}`));
		$.append($$anchor, div_1);
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_3();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
					DropdownMenu_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Open');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => DropdownMenu.Portal, ($$anchor, DropdownMenu_Portal) => {
					DropdownMenu_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_4 = $.first_child(fragment_1);

							$.component(node_4, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, $.spread_props(contentProps, {
									'data-testid': 'content',
									preventScroll: false,
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root_2();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
											DropdownMenu_Item($$anchor, {
												'data-testid': 'item-1',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Item 1');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
											DropdownMenu_Item_1($$anchor, {
												'data-testid': 'item-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Item 2');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
											DropdownMenu_Item_2($$anchor, {
												'data-testid': 'item-3',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Item 3');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								}));
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var node_8 = $.sibling(node_1, 2);

	$.each(node_8, 17, () => rows, $.index, ($$anchor, row) => {
		var div_2 = root_1();
		var text_5 = $.only_child(div_2);

		$.template_effect(() => $.set_text(text_5, `After row ${$.get(row) ?? ''}`));
		$.append($$anchor, div_2);
	});

	$.reset(div);
	$.append($$anchor, div);
}