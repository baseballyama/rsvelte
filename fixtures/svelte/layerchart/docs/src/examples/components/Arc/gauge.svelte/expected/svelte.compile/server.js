import * as $ from 'svelte/internal/server';

import {
	Arc,
	Chart,
	ClipPath,
	Group,
	Layer,
	Line,
	LinearGradient,
	Text
} from 'layerchart';

import { scaleLinear, scaleThreshold } from 'd3-scale';

export default function Gauge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 62;
		let outerRadius = 80;
		let innerRadius = 68;
		const domain = [0, 100];
		const angleRange = [-120, 120];
		const angleScale = scaleLinear().domain(domain).range(angleRange);
		const ticks = [0, 25, 50, 75, 100];

		const statusScale = scaleThreshold().domain([30, 70, 90]).range([
			{ label: 'Low', class: 'fill-red-500' },
			{ label: 'Good', class: 'fill-emerald-500' },
			{ label: 'Warning', class: 'fill-yellow-500' },
			{ label: 'Critical', class: 'fill-red-500' }
		]);

		const status = $.derived(() => statusScale(value));

		$$renderer.push(`<div class="flex flex-col items-center gap-2"><input type="range"${$.attr('min', 0)}${$.attr('max', 100)}${$.attr('value', value)} class="w-48"/> `);

		Chart($$renderer, {
			height: 160,
			padding: 20,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Group($$renderer, {
							y: 20,
							children: ($$renderer) => {
								{
									function children($$renderer, { gradient }) {
										{
											function clip($$renderer) {
												Arc($$renderer, {
													value,
													domain,
													range: angleRange,
													outerRadius,
													innerRadius,
													cornerRadius: 6,
													motion: 'spring'
												});
											}

											ClipPath($$renderer, {
												clip,
												children: ($$renderer) => {
													Arc($$renderer, {
														value: domain[1],
														domain,
														range: angleRange,
														outerRadius,
														innerRadius,
														cornerRadius: 6,
														fill: gradient
													});
												},
												$$slots: { clip: true, default: true }
											});
										}
									}

									LinearGradient($$renderer, {
										class: 'from-emerald-500 via-yellow-500 to-red-500',
										children,
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!----> `);

								Arc($$renderer, {
									value: domain[1],
									domain,
									range: angleRange,
									outerRadius,
									innerRadius,
									cornerRadius: 6,
									class: 'fill-none',
									track: { class: 'fill-none stroke-surface-content/10' }
								});

								$$renderer.push(`<!----> <!--[-->`);

								const each_array = $.ensure_array_like(ticks);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let tick = each_array[$$index];
									const angleDeg = angleScale(tick);
									const angleRad = angleDeg * Math.PI / 180;
									const tickOuter = innerRadius - 3;
									const tickInner = innerRadius - 10;
									const labelRadius = innerRadius - 16;

									Line($$renderer, {
										x1: Math.sin(angleRad) * tickInner,
										y1: -Math.cos(angleRad) * tickInner,
										x2: Math.sin(angleRad) * tickOuter,
										y2: -Math.cos(angleRad) * tickOuter,
										class: 'stroke-surface-content/40',
										strokeWidth: 1.5
									});

									$$renderer.push(`<!----> `);

									Text($$renderer, {
										x: Math.sin(angleRad) * labelRadius,
										y: -Math.cos(angleRad) * labelRadius,
										value: String(tick),
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										class: 'text-[8px] fill-surface-content/50 tabular-nums'
									});

									$$renderer.push(`<!---->`);
								}

								$$renderer.push(`<!--]--> `);

								Text($$renderer, {
									value: Math.round(value) + '%',
									textAnchor: 'middle',
									verticalAnchor: 'middle',
									class: 'text-3xl font-bold tabular-nums'
								});

								$$renderer.push(`<!----> `);

								Text($$renderer, {
									x: 0,
									y: 22,
									value: status().label,
									textAnchor: 'middle',
									verticalAnchor: 'middle',
									class: `text-[10px] font-medium ${status().class}`
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { data: value });
	});
}