import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import Button from './button.svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import InputLine from './inputLine.svelte';

var root = $.from_html(`<!> Add line`, 1);

export default function InputPolygon($$anchor, $$props) {
	$.push($$props, true);

	let nullable = $.prop($$props, 'nullable', 3, false),
		minDeletableIndex = $.prop($$props, 'minDeletableIndex', 3, 4);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 's',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => $$props.values, $.index, ($$anchor, value, index) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
						Layout_Stack_1($$anchor, {
							gap: 'xs',
							children: ($$anchor, $$slotProps) => {
								{
									const addLineButton = ($$anchor) => {
										var fragment_4 = $.comment();
										var node_3 = $.first_child(fragment_4);

										{
											var consequent = ($$anchor) => {
												Button($$anchor, {
													get disabled() {
														return nullable();
													},
													size: 'xs',
													compact: true,
													$$events: { click: () => $$props.onAddLine?.(-1) },
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root();
														var node_4 = $.first_child(fragment_6);

														Icon(node_4, {
															get icon() {
																return IconPlus;
															},
															size: 's'
														});

														$.next();
														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											};

											$.if(node_3, ($$render) => {
												if (index === $$props.values.length - 1) $$render(consequent);
											});
										}

										$.append($$anchor, fragment_4);
									};

									InputLine($$anchor, {
										get disabled() {
											return $$props.disabled;
										},

										get values() {
											return $.get(value);
										},
										onAddPoint: () => $$props.onAddPoint(index),
										get nullable() {
											return nullable();
										},
										onDeletePoint: () => $$props.onDeletePoint(index),
										onChangePoint: (pointIndex, coordIndex, newValue) => $$props.onChangePoint(index, pointIndex, coordIndex, newValue),
										allowLineDelete: index < 2,
										get minDeletableIndex() {
											return minDeletableIndex();
										},
										addLineButton,
										$$slots: { addLineButton: true }
									});
								}
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
	$.pop();
}