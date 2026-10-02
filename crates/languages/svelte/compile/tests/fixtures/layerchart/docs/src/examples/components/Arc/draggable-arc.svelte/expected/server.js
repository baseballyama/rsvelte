import * as $ from 'svelte/internal/server';
import { Arc, Chart, Layer, Text, cartesianToPolar, radiansToDegrees } from 'layerchart';
import { SpringValue } from 'svelte-ux';
import { localPoint } from '@layerstack/utils';

export default function Draggable_arc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 75;
		const data = { value };

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						const arcWidth = 20;
						const maxValue = 100;

						SpringValue($$renderer, {
							value,
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$renderer, { value: springValue }) => {
									Arc($$renderer, {
										value: springValue ?? 0,
										domain: [0, maxValue],
										innerRadius: -arcWidth,
										cornerRadius: 10,
										class: 'fill-secondary pointer-events-none',
										track: {
											class: 'fill-secondary/10',
											onpointerdown: (e) => {
												// pointer releative to center of chart and arc center
												const { x, y } = localPoint(e);

												const centerX = x - context.width / 2;
												const centerY = y - context.height / 2;
												const pointerAngle = radiansToDegrees(cartesianToPolar(centerX, centerY).radians);

												value = Math.round(pointerAngle / 360 * maxValue);
											},

											onpointermove: (e) => {
												if (e.buttons !== 1) {
													// button not pressed, ignoring
													return;
												}

												e.currentTarget?.setPointerCapture(e.pointerId);

												// pointer relative to center of chart and arc center
												const { x, y } = localPoint(e);

												const centerX = x - context.width / 2;
												const centerY = y - context.height / 2;
												const pointerAngle = radiansToDegrees(cartesianToPolar(centerX, centerY).radians);
												const newValue = Math.round(pointerAngle / 360 * maxValue);

												// 2.) Clamp to prevent wrapping around below 0 / above max
												if (value > maxValue * 0.75 && newValue < maxValue * 0.25) {
													// Do not allow wrapping around above max
													value = maxValue;
												} else if (value < maxValue * 0.25 && newValue > maxValue * 0.75) {
													// Do not allow wrapping around below 0
													value = 0;
												} else {
													value = newValue;
												}
											}
										}
									});

									$$renderer.push(`<!----> `);

									Text($$renderer, {
										value: Math.round(springValue ?? 0),
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										dy: 10,
										class: 'text-5xl tabular-nums'
									});

									$$renderer.push(`<!---->`);
								}
							}
						});
					},
					$$slots: { default: true }
				});
			}

			Chart($$renderer, {
				height: 200,
				padding: 20,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}