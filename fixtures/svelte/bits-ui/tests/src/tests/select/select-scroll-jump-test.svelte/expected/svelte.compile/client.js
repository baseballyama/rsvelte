import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../../app.css";
import { Select } from "bits-ui";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<main data-testid="main"><div data-testid="spacer-top" style="height: 900px;"></div> <div data-testid="anchor-zone" style="padding-left: 64px;"><!></div> <div data-testid="spacer-bottom" style="height: 2000px;"></div> <div data-testid="open-binding"> </div></main>`);

export default function Select_scroll_jump_test($$anchor, $$props) {
	$.push($$props, true);

	const items = Array.from({ length: 120 }, (_, i) => ({ value: `${i}`, label: `Item ${i}` }));
	let value = $.state("90");
	let open = $.state(false);
	const selectedLabel = $.derived(() => items.find((item) => item.value === $.get(value))?.label ?? "Open Listbox");
	var main = root_1();
	var div = $.sibling($.child(main), 2);
	var node = $.child(div);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(selectedLabel)));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Select.Portal, ($$anchor, Select_Portal) => {
					Select_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
								Select_Content($$anchor, {
									'data-testid': 'content',
									preventScroll: false,
									side: 'bottom',
									sideOffset: 8,
									style: { width: "220px", maxHeight: "220px", backgroundColor: "white" },
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Select.Viewport, ($$anchor, Select_Viewport) => {
											Select_Viewport($$anchor, {
												'data-testid': 'viewport',
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_5 = $.first_child(fragment_4);

													$.each(node_5, 17, () => items, (item) => item.value, ($$anchor, item) => {
														var fragment_5 = $.comment();
														var node_6 = $.first_child(fragment_5);

														{
															let $0 = $.derived(() => `item-${$.get(item).value}`);

															$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	get value() {
																		return $.get(item).value;
																	},

																	get label() {
																		return $.get(item).label;
																	},

																	get 'data-testid'() {
																		return $.get($0);
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text();

																		$.template_effect(() => $.set_text(text_1, $.get(item).label));
																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});
														}

														$.append($$anchor, fragment_5);
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);

	var div_1 = $.sibling(div, 4);
	var text_2 = $.only_child(div_1, true);

	$.reset(main);
	$.template_effect(() => $.set_text(text_2, $.get(open) ? "true" : "false"));
	$.append($$anchor, main);
	$.pop();
}