import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Icon, Layout } from '@appwrite.io/pink-svelte';
import InputPoint from './inputPoint.svelte';
import Button from './button.svelte';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';

var root = $.from_html(`<!> Add coordinate`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function InputLine($$anchor, $$props) {
	$.push($$props, true);

	let nullable = $.prop($$props, 'nullable', 3, false),
		minDeletableIndex = $.prop($$props, 'minDeletableIndex', 3, 2);

	function isDeleteDisabled(index) {
		let disable = index < minDeletableIndex();

		if ($$props.allowLineDelete !== undefined) {
			disable = disable && $$props.allowLineDelete;
		}

		return disable;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			alignItems: 'flex-start',
			gap: 'xs',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.each(node_2, 17, () => $$props.values, $.index, ($$anchor, value, index) => {
								{
									let $0 = $.derived(() => isDeleteDisabled(index));

									InputPoint($$anchor, {
										get disabled() {
											return $$props.disabled;
										},

										get nullable() {
											return nullable();
										},

										get values() {
											return $.get(value);
										},
										deletePoints: true,
										get disableDelete() {
											return $.get($0);
										},
										onDeletePoint: () => $$props.onDeletePoint(index),
										onChangePoint: (coordIndex, newValue) => $$props.onChangePoint?.(index, coordIndex, newValue)
									});
								}
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				{
					var consequent = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_4 = $.first_child(fragment_4);

						$.component(node_4, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
							Layout_Stack_2($$anchor, {
								direction: 'row',
								gap: 's',
								alignItems: 'center',
								children: ($$anchor, $$slotProps) => {
									var fragment_5 = root_1();
									var node_5 = $.first_child(fragment_5);

									{
										let $0 = $.derived(() => nullable() || $$props.disabled);

										Button(node_5, {
											size: 'xs',
											compact: true,
											get disabled() {
												return $.get($0);
											},
											$$events: { click: () => $$props.onAddPoint(-1) },
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = root();
												var node_6 = $.first_child(fragment_6);

												Icon(node_6, {
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
									}

									var node_7 = $.sibling(node_5, 2);

									$.snippet(node_7, () => $$props.addLineButton ?? $.noop);
									$.append($$anchor, fragment_5);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_4);
					};

					$.if(node_3, ($$render) => {
						if ($$props.values) $$render(consequent);
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}