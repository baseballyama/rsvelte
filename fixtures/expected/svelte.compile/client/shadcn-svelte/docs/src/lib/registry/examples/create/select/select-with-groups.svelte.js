import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Select_with_groups($$anchor, $$props) {
	$.push($$props, true);

	const fruits = [
		{ label: "Apple", value: "apple" },
		{ label: "Banana", value: "banana" },
		{ label: "Blueberry", value: "blueberry" }
	];

	const vegetables = [
		{ label: "Carrot", value: "carrot" },
		{ label: "Broccoli", value: "broccoli" },
		{ label: "Spinach", value: "spinach" }
	];

	let selectedValue = $.state(undefined);
	const selectedLabel = $.derived(() => [...fruits, ...vegetables].find((item) => item.value === $.get(selectedValue))?.label ?? "Select a fruit");

	Example($$anchor, {
		title: 'With Groups & Labels',
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
									var fragment_4 = root_1();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Select.Group, ($$anchor, Select_Group) => {
										Select_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root();
												var node_4 = $.first_child(fragment_5);

												$.component(node_4, () => Select.Label, ($$anchor, Select_Label) => {
													Select_Label($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_1 = $.text('Fruits');

															$.append($$anchor, text_1);
														},
														$$slots: { default: true }
													});
												});

												var node_5 = $.sibling(node_4, 2);

												$.each(node_5, 17, () => fruits, (item) => item.value, ($$anchor, item) => {
													var fragment_6 = $.comment();
													var node_6 = $.first_child(fragment_6);

													$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
														Select_Item($$anchor, {
															get value() {
																return $.get(item).value;
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text();

																$.template_effect(() => $.set_text(text_2, $.get(item).label));
																$.append($$anchor, text_2);
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

									var node_7 = $.sibling(node_3, 2);

									$.component(node_7, () => Select.Separator, ($$anchor, Select_Separator) => {
										Select_Separator($$anchor, {});
									});

									var node_8 = $.sibling(node_7, 2);

									$.component(node_8, () => Select.Group, ($$anchor, Select_Group_1) => {
										Select_Group_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root();
												var node_9 = $.first_child(fragment_8);

												$.component(node_9, () => Select.Label, ($$anchor, Select_Label_1) => {
													Select_Label_1($$anchor, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Vegetables');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});

												var node_10 = $.sibling(node_9, 2);

												$.each(node_10, 17, () => vegetables, (item) => item.value, ($$anchor, item) => {
													var fragment_9 = $.comment();
													var node_11 = $.first_child(fragment_9);

													$.component(node_11, () => Select.Item, ($$anchor, Select_Item_1) => {
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

													$.append($$anchor, fragment_9);
												});

												$.append($$anchor, fragment_8);
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