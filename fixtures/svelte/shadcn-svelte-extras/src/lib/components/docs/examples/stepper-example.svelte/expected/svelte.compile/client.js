import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Stepper from '$lib/components/ui/stepper';
import Search from '@lucide/svelte/icons/search';
import Download from '@lucide/svelte/icons/download';
import Code from '@lucide/svelte/icons/code';

var root = $.from_html(`<!> <div class="flex flex-col"></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="rounded-lg border p-6"><!></div>`);

export default function Stepper_example($$anchor) {
	let step = $.state(1);

	const steps = [
		{ step: 1, icon: Search },
		{ step: 2, icon: Download },
		{ step: 3, icon: Code }
	];

	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Stepper.Root, ($$anchor, Stepper_Root) => {
		Stepper_Root($$anchor, {
			get step() {
				return $.get(step);
			},

			set step($$value) {
				$.set(step, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Stepper.Nav, ($$anchor, Stepper_Nav) => {
					Stepper_Nav($$anchor, {
						orientation: 'horizontal',
						class: 'w-full justify-between px-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.each(node_2, 17, () => steps, (item) => item.step, ($$anchor, item) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Stepper.Item, ($$anchor, Stepper_Item) => {
									Stepper_Item($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root_1();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Stepper.Trigger, ($$anchor, Stepper_Trigger) => {
												Stepper_Trigger($$anchor, {
													class: 'flex max-w-[150px] flex-col items-center',
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = root();
														var node_5 = $.first_child(fragment_4);

														$.component(node_5, () => Stepper.Indicator, ($$anchor, Stepper_Indicator) => {
															Stepper_Indicator($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_5 = $.comment();
																	var node_6 = $.first_child(fragment_5);

																	$.component(node_6, () => $.get(item).icon, ($$anchor, item_icon) => {
																		item_icon($$anchor, {});
																	});

																	$.append($$anchor, fragment_5);
																},
																$$slots: { default: true }
															});
														});

														$.next(2);
														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var node_7 = $.sibling(node_4, 2);

											$.component(node_7, () => Stepper.Separator, ($$anchor, Stepper_Separator) => {
												Stepper_Separator($$anchor, {});
											});

											$.append($$anchor, fragment_3);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							});

							$.append($$anchor, fragment_1);
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
	$.append($$anchor, div);
}