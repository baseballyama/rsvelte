import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/elements/forms';
import { IconPlus } from '@appwrite.io/pink-icons-svelte';
import { Layout, Typography, Icon } from '@appwrite.io/pink-svelte';
import { getDefaultSpatialData, getSingleRingPolygon } from '../../../store';
import InputPolygon from '$lib/elements/forms/inputPolygon.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Polygon($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		limited = $.prop($$props, 'limited', 3, false);

	function pushCoordinate(ringIndex) {
		const ring = value()[ringIndex];

		if (!ring) return;

		const newPoint = getDefaultSpatialData('point');
		const newRing = [...ring];

		newRing.splice(newRing.length - 1, 0, newPoint);
		newRing[newRing.length - 1] = [...newRing[0]];
		value(value().map((r, i) => i === ringIndex ? newRing : r));
	}

	function pushLine() {
		if (!value()) return;

		value([...value(), getSingleRingPolygon()]);
	}

	function deleteCoordinate(ringIndex) {
		if (!value()) return;

		value(value().map((ring, i) => i === ringIndex ? ring.slice(0, -1) : ring).filter((ring) => ring.length > 0));
	}

	function handlePointChange(lineIndex, pointIndex, coordIndex, newValue) {
		if (value() && value()[lineIndex] && value()[lineIndex][pointIndex]) {
			value(value()[lineIndex][pointIndex][coordIndex] = newValue, true);
			value([...value()]);
		}
	}

	function handleAddDefault() {
		value(getDefaultSpatialData('polygon'));
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
															var text_2 = $.text('Polygon');

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

											var text_3 = $.text('Add Polygon');

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

				InputPolygon(node_7, {
					get values() {
						return value();
					},
					nullable: false,
					onAddLine: pushLine,
					onAddPoint: pushCoordinate,
					onDeletePoint: deleteCoordinate,
					onChangePoint: handlePointChange
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}