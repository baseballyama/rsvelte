import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Select from "$lib/registry/ui/select/index.js";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Button_group_with_select_and_input($$anchor, $$props) {
	$.push($$props, true);

	const durationItems = [
		{ label: "Hours", value: "hours" },
		{ label: "Days", value: "days" },
		{ label: "Weeks", value: "weeks" }
	];

	let duration = $.state($.proxy(durationItems[0].value));
	const durationLabel = $.derived(() => durationItems.find((item) => item.value === $.get(duration))?.label ?? "Hours");

	Example($$anchor, {
		title: 'With Select and Input',
		children: ($$anchor, $$slotProps) => {
			ButtonGroup($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
						Select_Root($$anchor, {
							type: 'single',
							get value() {
								return $.get(duration);
							},

							set value($$value) {
								$.set(duration, $$value, true);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_1 = $.first_child(fragment_3);

								$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
									Select_Trigger($$anchor, {
										id: 'duration',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $.get(durationLabel)));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								var node_2 = $.sibling(node_1, 2);

								$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
									Select_Content($$anchor, {
										align: 'start',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_3 = $.first_child(fragment_5);

											$.component(node_3, () => Select.Group, ($$anchor, Select_Group) => {
												Select_Group($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = $.comment();
														var node_4 = $.first_child(fragment_6);

														$.each(node_4, 17, () => durationItems, (item) => item.value, ($$anchor, item) => {
															var fragment_7 = $.comment();
															var node_5 = $.first_child(fragment_7);

															$.component(node_5, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	get value() {
																		return $.get(item).value;
																	},

																	get label() {
																		return $.get(item).label;
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

															$.append($$anchor, fragment_7);
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
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

					var node_6 = $.sibling(node, 2);

					Input(node_6, {});
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}