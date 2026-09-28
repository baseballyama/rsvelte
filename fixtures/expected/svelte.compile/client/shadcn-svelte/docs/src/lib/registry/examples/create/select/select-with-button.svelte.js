import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Button from "$lib/registry/ui/button/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4"><div class="flex items-center gap-2"><!> <!></div> <div class="flex items-center gap-2"><!> <!></div></div>`);

export default function Select_with_button($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ label: "Apple", value: "apple" },
		{ label: "Banana", value: "banana" },
		{ label: "Blueberry", value: "blueberry" }
	];

	let selectedValueSm = $.state(undefined);
	let selectedValueDefault = $.state(undefined);
	const selectedLabelSm = $.derived(() => items.find((item) => item.value === $.get(selectedValueSm))?.label ?? "Small");
	const selectedLabelDefault = $.derived(() => items.find((item) => item.value === $.get(selectedValueDefault))?.label ?? "Default");

	Example($$anchor, {
		title: 'With Button',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var div_1 = $.child(div);
			var node = $.child(div_1);

			$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(selectedValueSm);
					},

					set value($$value) {
						$.set(selectedValueSm, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								size: 'sm',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(selectedLabelSm)));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Select.Group, ($$anchor, Select_Group) => {
										Select_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_4 = $.first_child(fragment_4);

												$.each(node_4, 17, () => items, (item) => item.value, ($$anchor, item) => {
													var fragment_5 = $.comment();
													var node_5 = $.first_child(fragment_5);

													$.component(node_5, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															get value() {
																return $.get(item).value;
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

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			var node_6 = $.sibling(node, 2);

			$.component(node_6, () => Button.Root, ($$anchor, Button_Root) => {
				Button_Root($$anchor, {
					variant: 'outline',
					size: 'sm',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Submit');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_7 = $.child(div_2);

			$.component(node_7, () => Select.Root, ($$anchor, Select_Root_1) => {
				Select_Root_1($$anchor, {
					type: 'single',
					get value() {
						return $.get(selectedValueDefault);
					},

					set value($$value) {
						$.set(selectedValueDefault, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root();
						var node_8 = $.first_child(fragment_7);

						$.component(node_8, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
							Select_Trigger_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text();

									$.template_effect(() => $.set_text(text_3, $.get(selectedLabelDefault)));
									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => Select.Content, ($$anchor, Select_Content_1) => {
							Select_Content_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = $.comment();
									var node_10 = $.first_child(fragment_9);

									$.component(node_10, () => Select.Group, ($$anchor, Select_Group_1) => {
										Select_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = $.comment();
												var node_11 = $.first_child(fragment_10);

												$.each(node_11, 17, () => items, (item) => item.value, ($$anchor, item) => {
													var fragment_11 = $.comment();
													var node_12 = $.first_child(fragment_11);

													$.component(node_12, () => Select.Item, ($$anchor, Select_Item_1) => {
														Select_Item_1($$anchor, {
															get value() {
																return $.get(item).value;
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text();

																$.template_effect(() => $.set_text(text_4, $.get(item).label));
																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			var node_13 = $.sibling(node_7, 2);

			$.component(node_13, () => Button.Root, ($$anchor, Button_Root_1) => {
				Button_Root_1($$anchor, {
					variant: 'outline',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text('Submit');

						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_2);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}