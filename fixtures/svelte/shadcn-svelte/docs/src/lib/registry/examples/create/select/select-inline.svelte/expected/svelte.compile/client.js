import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Input from "$lib/registry/ui/input/index.js";
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center gap-2"><!> <!> <!></div>`);

export default function Select_inline($$anchor, $$props) {
	$.push($$props, true);

	const items = [
		{ label: "All", value: "all" },
		{ label: "Active", value: "active" },
		{ label: "Inactive", value: "inactive" }
	];

	let selectedValue = $.state(undefined);
	const selectedLabel = $.derived(() => items.find((item) => item.value === $.get(selectedValue))?.label ?? "Filter");

	Example($$anchor, {
		title: 'Inline with Input & NativeSelect',
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			$.component(node, () => Input.Root, ($$anchor, Input_Root) => {
				Input_Root($$anchor, { placeholder: 'Search...', class: 'flex-1' });
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(selectedValue);
					},

					set value($$value) {
						$.set(selectedValue, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root();
						var node_2 = $.first_child(fragment_1);

						$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								class: 'w-[140px]',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(selectedLabel)));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_4 = $.first_child(fragment_3);

									$.component(node_4, () => Select.Group, ($$anchor, Select_Group) => {
										Select_Group($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_4 = $.comment();
												var node_5 = $.first_child(fragment_4);

												$.each(node_5, 17, () => items, (item) => item.value, ($$anchor, item) => {
													var fragment_5 = $.comment();
													var node_6 = $.first_child(fragment_5);

													$.component(node_6, () => Select.Item, ($$anchor, Select_Item) => {
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

			var node_7 = $.sibling(node_1, 2);

			$.component(node_7, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
				NativeSelect_Root($$anchor, {
					class: 'w-[140px]',
					children: ($$anchor, $$slotProps) => {
						var fragment_7 = root_1();
						var node_8 = $.first_child(fragment_7);

						$.component(node_8, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
							NativeSelect_Option($$anchor, {
								value: '',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Sort by');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
						});

						var node_9 = $.sibling(node_8, 2);

						$.component(node_9, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
							NativeSelect_Option_1($$anchor, {
								value: 'name',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Name');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_10 = $.sibling(node_9, 2);

						$.component(node_10, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
							NativeSelect_Option_2($$anchor, {
								value: 'date',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Date');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
							NativeSelect_Option_3($$anchor, {
								value: 'status',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('Status');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_7);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}