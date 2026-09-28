import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, Chart, Layer, Text, cartesianToPolar, radiansToDegrees } from 'layerchart';
import { SpringValue } from 'svelte-ux';
import { localPoint } from '@layerstack/utils';

var root = $.from_html(`<!> <!>`, 1);

export default function Draggable_arc($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state(75);
	const data = { value: $.get(value) };
	var $$exports = { data };

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				center: true,
				children: ($$anchor, $$slotProps) => {
					const arcWidth = $.derived(() => 20);
					const maxValue = $.derived(() => 100);

					SpringValue($$anchor, {
						get value() {
							return $.get(value);
						},
						children: $.invalid_default_snippet,
						$$slots: {
							default: ($$anchor, $$slotProps) => {
								const springValue = $.derived(() => $$slotProps.value);
								var fragment_3 = root();
								var node = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => $.get(springValue) ?? 0);

									Arc(node, {
										get value() {
											return $.get($0);
										},
										domain: [0, $.get(maxValue)],
										innerRadius: -$.get(arcWidth),
										cornerRadius: 10,
										class: 'fill-secondary pointer-events-none',
										track: {
											class: 'fill-secondary/10',
											onpointerdown: (e) => {
												// pointer releative to center of chart and arc center
												const { x, y } = localPoint(e);

												const centerX = x - context().width / 2;
												const centerY = y - context().height / 2;
												const pointerAngle = radiansToDegrees(cartesianToPolar(centerX, centerY).radians);

												$.set(value, Math.round(pointerAngle / 360 * $.get(maxValue)), true);
											},

											onpointermove: (e) => {
												if (e.buttons !== 1) {
													// button not pressed, ignoring
													return;
												}

												e.currentTarget?.setPointerCapture(e.pointerId);

												// pointer relative to center of chart and arc center
												const { x, y } = localPoint(e);

												const centerX = x - context().width / 2;
												const centerY = y - context().height / 2;
												const pointerAngle = radiansToDegrees(cartesianToPolar(centerX, centerY).radians);
												const newValue = Math.round(pointerAngle / 360 * $.get(maxValue));

												// 2.) Clamp to prevent wrapping around below 0 / above max
												if ($.get(value) > $.get(maxValue) * 0.75 && newValue < $.get(maxValue) * 0.25) {
													// Do not allow wrapping around above max
													$.set(value, $.get(maxValue));
												} else if ($.get(value) < $.get(maxValue) * 0.25 && newValue > $.get(maxValue) * 0.75) {
													// Do not allow wrapping around below 0
													$.set(value, 0);
												} else {
													$.set(value, newValue, true);
												}
											}
										}
									});
								}

								var node_1 = $.sibling(node, 2);

								{
									let $0 = $.derived(() => Math.round($.get(springValue) ?? 0));

									Text(node_1, {
										get value() {
											return $.get($0);
										},
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										dy: 10,
										class: 'text-5xl tabular-nums'
									});
								}

								$.append($$anchor, fragment_3);
							}
						}
					});
				},
				$$slots: { default: true }
			});
		};

		Chart($$anchor, {
			height: 200,
			padding: 20,
			children,
			$$slots: { default: true }
		});
	}

	return $.pop($$exports);
}