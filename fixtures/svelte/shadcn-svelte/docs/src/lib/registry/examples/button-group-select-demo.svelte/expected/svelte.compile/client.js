import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowRight from "@lucide/svelte/icons/arrow-right";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";

var root = $.from_html(` <span class="text-muted-foreground"> </span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Button_group_select_demo($$anchor) {
	const CURRENCIES = [
		{ value: "$", label: "US Dollar" },
		{ value: "€", label: "Euro" },
		{ value: "£", label: "British Pound" }
	];

	let currency = $.state("$");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root) => {
		ButtonGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_1) => {
					ButtonGroup_Root_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return $.get(currency);
									},

									set value($$value) {
										$.set(currency, $$value, true);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												class: 'font-mono',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, $.get(currency)));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												class: 'min-w-24',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_5 = $.first_child(fragment_5);

													$.each(node_5, 17, () => CURRENCIES, (currencyOption) => currencyOption.value, ($$anchor, currencyOption) => {
														var fragment_6 = $.comment();
														var node_6 = $.first_child(fragment_6);

														$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
															Select_Item($$anchor, {
																get value() {
																	return $.get(currencyOption).value;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var fragment_7 = root();
																	var text_1 = $.first_child(fragment_7);
																	var span = $.sibling(text_1);
																	var text_2 = $.only_child(span, true);

																	$.template_effect(() => {
																		$.set_text(text_1, `${$.get(currencyOption).value ?? ''} `);
																		$.set_text(text_2, $.get(currencyOption).label);
																	});

																	$.append($$anchor, fragment_7);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
													});

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_2, 2);

							Input(node_7, { placeholder: '10.00', pattern: '[0-9]*' });
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_1, 2);

				$.component(node_8, () => ButtonGroup.Root, ($$anchor, ButtonGroup_Root_2) => {
					ButtonGroup_Root_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								'aria-label': 'Send',
								size: 'icon',
								variant: 'outline',
								children: ($$anchor, $$slotProps) => {
									ArrowRight($$anchor, {});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}