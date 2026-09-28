import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Select_basic($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ label: "Apple", value: "apple" },
		{ label: "Banana", value: "banana" },
		{ label: "Blueberry", value: "blueberry" },
		{ label: "Grapes", value: "grapes", disabled: true },
		{ label: "Pineapple", value: "pineapple" }
	];

	let selectedValue = $.state(undefined);
	const selectedLabel = $.derived(() => items.find((item) => item.value === $.get(selectedValue))?.label ?? "Select a fruit");

	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(selectedValue);
					},

					set value($$value) {
						$.set(selectedValue, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
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

						$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Select.Group, ($$anchor, Select_Group) => {
										Select_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_4 = $.first_child(fragment_5);

												$.each(node_4, 17, () => items, (item) => item.value, ($$anchor, item) => {
													var fragment_6 = $.comment();
													var node_5 = $.first_child(fragment_6);

													$.component(node_5, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															get value() {
																return $.get(item).value;
															},

															get disabled() {
																return $.get(item).disabled;
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

													$.append($$anchor, fragment_6);
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}