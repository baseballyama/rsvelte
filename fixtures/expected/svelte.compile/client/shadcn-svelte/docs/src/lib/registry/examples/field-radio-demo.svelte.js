import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="w-full max-w-md"><!></div>`);

export default function Field_radio_demo($$anchor) {
	let plan = $.state("monthly");
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Field.Set, ($$anchor, Field_Set) => {
		Field_Set($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
					Field_Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Subscription Plan');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Field.Description, ($$anchor, Field_Description) => {
					Field_Description($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Yearly and lifetime plans offer significant savings.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
					RadioGroup_Root($$anchor, {
						get value() {
							return $.get(plan);
						},

						set value($$value) {
							$.set(plan, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_4 = $.first_child(fragment_1);

							$.component(node_4, () => Field.Field, ($$anchor, Field_Field) => {
								Field_Field($$anchor, {
									orientation: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_5 = $.first_child(fragment_2);

										$.component(node_5, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
											RadioGroup_Item($$anchor, { value: 'monthly', id: 'plan-monthly' });
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Field.Label, ($$anchor, Field_Label_1) => {
											Field_Label_1($$anchor, {
												for: 'plan-monthly',
												class: 'font-normal',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Monthly ($9.99/month)');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_7 = $.sibling(node_4, 2);

							$.component(node_7, () => Field.Field, ($$anchor, Field_Field_1) => {
								Field_Field_1($$anchor, {
									orientation: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_8 = $.first_child(fragment_3);

										$.component(node_8, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
											RadioGroup_Item_1($$anchor, { value: 'yearly', id: 'plan-yearly' });
										});

										var node_9 = $.sibling(node_8, 2);

										$.component(node_9, () => Field.Label, ($$anchor, Field_Label_2) => {
											Field_Label_2($$anchor, {
												for: 'plan-yearly',
												class: 'font-normal',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Yearly ($99.99/year)');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_7, 2);

							$.component(node_10, () => Field.Field, ($$anchor, Field_Field_2) => {
								Field_Field_2($$anchor, {
									orientation: 'horizontal',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_11 = $.first_child(fragment_4);

										$.component(node_11, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
											RadioGroup_Item_2($$anchor, { value: 'lifetime', id: 'plan-lifetime' });
										});

										var node_12 = $.sibling(node_11, 2);

										$.component(node_12, () => Field.Label, ($$anchor, Field_Label_3) => {
											Field_Label_3($$anchor, {
												for: 'plan-lifetime',
												class: 'font-normal',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Lifetime ($299.99)');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
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
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}