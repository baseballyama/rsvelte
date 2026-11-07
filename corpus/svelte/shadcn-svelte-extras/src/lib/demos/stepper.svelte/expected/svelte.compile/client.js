import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Stepper from '$lib/components/ui/stepper';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-10/12 flex-col gap-8 px-4"><!> <div class="flex w-full justify-between"><!> <!></div></div>`);

export default function Stepper_1($$anchor) {
	let step = $.state(2);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Stepper.Root, ($$anchor, Stepper_Root) => {
		Stepper_Root($$anchor, {
			get step() {
				return $.get(step);
			},

			set step($$value) {
				$.set(step, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var div = root_1();
				var node_1 = $.child(div);

				$.component(node_1, () => Stepper.Nav, ($$anchor, Stepper_Nav) => {
					Stepper_Nav($$anchor, {
						orientation: 'horizontal',
						class: 'justify-between',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = $.comment();
							var node_2 = $.first_child(fragment_1);

							$.each(node_2, 16, () => Array.from({ length: 4 }), $.index, ($$anchor, _, index) => {
								var fragment_2 = $.comment();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Stepper.Item, ($$anchor, Stepper_Item) => {
									Stepper_Item($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_3 = root();
											var node_4 = $.first_child(fragment_3);

											$.component(node_4, () => Stepper.Trigger, ($$anchor, Stepper_Trigger) => {
												Stepper_Trigger($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_4 = $.comment();
														var node_5 = $.first_child(fragment_4);

														$.component(node_5, () => Stepper.Indicator, ($$anchor, Stepper_Indicator) => {
															Stepper_Indicator($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text = $.text();

																	text.nodeValue = index + 1;
																	$.append($$anchor, text);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_4);
													},
													$$slots: { default: true }
												});
											});

											var node_6 = $.sibling(node_4, 2);

											$.component(node_6, () => Stepper.Separator, ($$anchor, Stepper_Separator) => {
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

				var div_1 = $.sibling(node_1, 2);
				var node_7 = $.child(div_1);

				$.component(node_7, () => Stepper.Previous, ($$anchor, Stepper_Previous) => {
					Stepper_Previous($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Previous');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_7, 2);

				$.component(node_8, () => Stepper.Next, ($$anchor, Stepper_Next) => {
					Stepper_Next($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Next');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);
				$.reset(div);
				$.append($$anchor, div);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}