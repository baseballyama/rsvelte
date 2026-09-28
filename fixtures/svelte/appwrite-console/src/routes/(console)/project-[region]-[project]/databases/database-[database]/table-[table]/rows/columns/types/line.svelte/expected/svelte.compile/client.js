import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InputLine } from '$lib/elements/forms';
import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
import { Button } from '$lib/elements/forms';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { getDefaultSpatialData } from '../../../store';

var root = $.from_html(`<!> <!>`, 1);

export default function Line($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		limited = $.prop($$props, 'limited', 3, false);

	const defaultData = getDefaultSpatialData('linestring');

	function onAddPoint() {
		value([...value() || defaultData, getDefaultSpatialData('point')]);
	}

	function onDeletePoint() {
		if (value() && value()?.length > 2) value(value().slice(0, value().length - 1));
	}

	function handlePointChange(pointIndex, coordIndex, newValue) {
		if (value() && value()[pointIndex]) {
			value(value()[pointIndex][coordIndex] = newValue, true);
			value([...value()]);
		}
	}

	function handleAddDefault() {
		value(getDefaultSpatialData('linestring'));
	}

	const nullable = $.derived(() => !limited() ? !$$props.column.required : false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						direction: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_2) => {
								Layout_Stack_2($$anchor, {
									direction: 'row',
									alignItems: 'center',
									gap: 's',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Typography.Text, ($$anchor, Typography_Text) => {
											Typography_Text($$anchor, {
												variant: 'm-500',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text();

													$.template_effect(() => $.set_text(text, $$props.label));
													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => Typography.Text, ($$anchor, Typography_Text_1) => {
											Typography_Text_1($$anchor, {
												variant: 'm-400',
												color: '--fgcolor-neutral-tertiary',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = $.comment();
													var node_5 = $.first_child(fragment_5);

													{
														var consequent = ($$anchor) => {
															var text_1 = $.text('optional');

															$.append($$anchor, text_1);
														};

														var alternate = ($$anchor) => {
															var text_2 = $.text('Line');

															$.append($$anchor, text_2);
														};

														$.if(node_5, ($$render) => {
															if ($.get(nullable)) $$render(consequent); else $$render(alternate, -1);
														});
													}

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

							var node_6 = $.sibling(node_2, 2);

							{
								var consequent_1 = ($$anchor) => {
									Button($$anchor, {
										secondary: true,
										$$events: { click: handleAddDefault },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('Add Line');

											$.append($$anchor, text_3);
										},

										$$slots: {
											default: true,
											start: ($$anchor, $$slotProps) => {
												Icon($$anchor, {
													get icon() {
														return IconPlus;
													},
													slot: 'start',
													size: 's'
												});
											}
										}
									});
								};

								$.if(node_6, ($$render) => {
									if (!value()) $$render(consequent_1);
								});
							}

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_7 = $.sibling(node_1, 2);

				InputLine(node_7, {
					get values() {
						return value();
					},
					nullable: false,
					onAddPoint,
					onDeletePoint,
					onChangePoint: handlePointChange,
					minDeletableIndex: 2
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}