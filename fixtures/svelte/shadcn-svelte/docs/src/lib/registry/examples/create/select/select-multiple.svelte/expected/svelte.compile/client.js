import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Select_multiple($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ label: "Apple", value: "apple" },
		{ label: "Banana", value: "banana" },
		{ label: "Blueberry", value: "blueberry" },
		{ label: "Grapes", value: "grapes" },
		{ label: "Pineapple", value: "pineapple" },
		{ label: "Strawberry", value: "strawberry" },
		{ label: "Watermelon", value: "watermelon" }
	];

	let selectedValues = $.state($.proxy([]));

	const selectedLabel = $.derived(() => {
		if ($.get(selectedValues).length === 0) {
			return "Select fruits";
		}

		if ($.get(selectedValues).length === 1) {
			return items.find((item) => item.value === $.get(selectedValues)[0])?.label;
		}

		return `${$.get(selectedValues).length} fruits selected`;
	});

	Example($$anchor, {
		title: 'Multiple Selection',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'multiple',
					get value() {
						return $.get(selectedValues);
					},

					set value($$value) {
						$.set(selectedValues, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								class: 'w-72',
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