import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";

var root = $.from_html(`<!> <!>`, 1);

export default function Select_demo($$anchor, $$props) {
	$.push($$props, true);

	const fruits = [
		{ value: "apple", label: "Apple" },
		{ value: "banana", label: "Banana" },
		{ value: "blueberry", label: "Blueberry" },
		{ value: "grapes", label: "Grapes" },
		{ value: "pineapple", label: "Pineapple" }
	];

	let value = $.state("");
	const triggerContent = $.derived(() => fruits.find((f) => f.value === $.get(value))?.label ?? "Select a fruit");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			name: 'favoriteFruit',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'w-[180px]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(triggerContent)));
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
										var fragment_4 = root();
										var node_4 = $.first_child(fragment_4);

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

										$.each(node_5, 17, () => fruits, (fruit) => fruit.value, ($$anchor, fruit) => {
											var fragment_5 = $.comment();
											var node_6 = $.first_child(fragment_5);

											{
												let $0 = $.derived(() => $.get(fruit).value === "grapes");

												$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
													Select_Item($$anchor, {
														get value() {
															return $.get(fruit).value;
														},

														get label() {
															return $.get(fruit).label;
														},

														get disabled() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text();

															$.template_effect(() => $.set_text(text_2, $.get(fruit).label));
															$.append($$anchor, text_2);
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}