import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div data-testid="container" style="display: flex; flex-direction: column; gap: 1000px; padding: 100px;"><button data-testid="top-button">Top Button (for focus testing)</button> <div data-testid="dropdown-1-container"><!> <div data-testid="binding-1"> </div></div> <div data-testid="dropdown-2-container"><!> <div data-testid="binding-2"> </div></div> <div data-testid="dropdown-3-container"><!> <div data-testid="binding-3"> </div></div> <button data-testid="bottom-button">Bottom Button (for focus testing)</button></div>`);

export default function Dropdown_menu_multiple_test($$anchor, $$props) {
	let contentProps = $.prop($$props, 'contentProps', 19, () => ({}));
	let open1 = $.state(false);
	let open2 = $.state(false);
	let open3 = $.state(false);
	var div = root_1();
	var div_1 = $.sibling($.child(div), 2);
	var node = $.child(div_1);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			get open() {
				return $.get(open1);
			},

			set open($$value) {
				$.set(open1, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
					DropdownMenu_Trigger($$anchor, {
						'data-testid': 'trigger-1',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Open Dropdown 1');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, $.spread_props({ 'data-testid': 'content-1' }, contentProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_3 = $.first_child(fragment_1);

							$.component(node_3, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
								DropdownMenu_Item($$anchor, {
									'data-testid': 'item-1',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Item 1');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
								DropdownMenu_Item_1($$anchor, {
									'data-testid': 'item-1-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Item 2');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	var div_2 = $.sibling(node, 2);
	var text_3 = $.only_child(div_2, true);

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_5 = $.child(div_3);

	$.component(node_5, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_1) => {
		DropdownMenu_Root_1($$anchor, {
			get open() {
				return $.get(open2);
			},

			set open($$value) {
				$.set(open2, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_6 = $.first_child(fragment_2);

				$.component(node_6, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_1) => {
					DropdownMenu_Trigger_1($$anchor, {
						'data-testid': 'trigger-2',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Open Dropdown 2');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_6, 2);

				$.component(node_7, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
					DropdownMenu_Content_1($$anchor, $.spread_props({ 'data-testid': 'content-2' }, contentProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_8 = $.first_child(fragment_3);

							$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
								DropdownMenu_Item_2($$anchor, {
									'data-testid': 'item-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Item 1');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							var node_9 = $.sibling(node_8, 2);

							$.component(node_9, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
								DropdownMenu_Item_3($$anchor, {
									'data-testid': 'item-2-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Item 2');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment_2);
			},
			$$slots: { default: true }
		});
	});

	var div_4 = $.sibling(node_5, 2);
	var text_7 = $.only_child(div_4, true);

	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var node_10 = $.child(div_5);

	$.component(node_10, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root_2) => {
		DropdownMenu_Root_2($$anchor, {
			get open() {
				return $.get(open3);
			},

			set open($$value) {
				$.set(open3, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root();
				var node_11 = $.first_child(fragment_4);

				$.component(node_11, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger_2) => {
					DropdownMenu_Trigger_2($$anchor, {
						'data-testid': 'trigger-3',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Open Dropdown 3');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				});

				var node_12 = $.sibling(node_11, 2);

				$.component(node_12, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_2) => {
					DropdownMenu_Content_2($$anchor, $.spread_props({ 'data-testid': 'content-3' }, contentProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_5 = root();
							var node_13 = $.first_child(fragment_5);

							$.component(node_13, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
								DropdownMenu_Item_4($$anchor, {
									'data-testid': 'item-3',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text('Item 1');

										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_13, 2);

							$.component(node_14, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
								DropdownMenu_Item_5($$anchor, {
									'data-testid': 'item-3-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_10 = $.text('Item 2');

										$.append($$anchor, text_10);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_5);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	var div_6 = $.sibling(node_10, 2);
	var text_11 = $.only_child(div_6, true);

	$.reset(div_5);
	$.next(2);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_3, $.get(open1));
		$.set_text(text_7, $.get(open2));
		$.set_text(text_11, $.get(open3));
	});

	$.append($$anchor, div);
}