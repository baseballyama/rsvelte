import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '@appwrite.io/pink-svelte';
import { Layout, Icon } from '@appwrite.io/pink-svelte';
import Button from './button.svelte';
import { IconX } from '@appwrite.io/pink-icons-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function InputPoint($$anchor, $$props) {
	$.push($$props, true);

	const nullableSkeletonShape = [0, 0];

	let nullable = $.prop($$props, 'nullable', 3, false),
		deletePoints = $.prop($$props, 'deletePoints', 3, false),
		disableDelete = $.prop($$props, 'disableDelete', 3, false);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						direction: 'row',
						gap: 'm',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.each(node_3, 17, () => nullableSkeletonShape, $.index, ($$anchor, _, index) => {
										var fragment_4 = $.comment();
										var node_4 = $.first_child(fragment_4);

										$.component(node_4, () => Input.Number, ($$anchor, Input_Number) => {
											Input_Number($$anchor, { id: `default-${index}`, placeholder: '0', disabled: true });
										});

										$.append($$anchor, fragment_4);
									});

									$.append($$anchor, fragment_3);
								};

								var alternate = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_5 = $.first_child(fragment_5);

									$.each(node_5, 17, () => $$props.values, $.index, ($$anchor, _, index) => {
										var fragment_6 = $.comment();
										var node_6 = $.first_child(fragment_6);

										$.component(node_6, () => Input.Number, ($$anchor, Input_Number_1) => {
											Input_Number_1($$anchor, {
												id: `point-${index}`,
												placeholder: 'Enter value',
												step: 0.0001,
												get value() {
													return $$props.values[index];
												},

												get disabled() {
													return $$props.disabled;
												},

												$$events: {
													change: (e) => $$props.onChangePoint(index, Number.parseFloat(`${e.detail}`))
												}
											});
										});

										$.append($$anchor, fragment_6);
									});

									$.append($$anchor, fragment_5);
								};

								$.if(node_2, ($$render) => {
									if (nullable()) $$render(consequent); else $$render(alternate, -1);
								});
							}

							var node_7 = $.sibling(node_2, 2);

							{
								var consequent_1 = ($$anchor) => {
									{
										let $0 = $.derived(() => nullable() || disableDelete() || $$props.disabled);

										Button($$anchor, {
											size: 's',
											secondary: true,
											get disabled() {
												return $.get($0);
											},
											$$events: { click: () => $$props.onDeletePoint?.() },
											children: ($$anchor, $$slotProps) => {
												Icon($$anchor, {
													get icon() {
														return IconX;
													},
													size: 's'
												});
											},
											$$slots: { default: true }
										});
									}
								};

								$.if(node_7, ($$render) => {
									if (deletePoints()) $$render(consequent_1);
								});
							}

							$.append($$anchor, fragment_2);
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