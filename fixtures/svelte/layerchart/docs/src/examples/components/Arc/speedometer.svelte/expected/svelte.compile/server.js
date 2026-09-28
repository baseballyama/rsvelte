import * as $ from 'svelte/internal/server';
import { Arc, Chart, Circle, Group, Layer, Line, Text } from 'layerchart';
import { scaleLinear } from 'd3-scale';

export default function Speedometer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let speed = 45;
		const domain = [0, 120];
		const angleRange = [-120, 120];
		let outerRadius = 80;
		let innerRadius = 70;
		const angleScale = scaleLinear().domain(domain).range(angleRange);

		const zones = [
			{ min: 0, max: 45, class: 'fill-emerald-500' },
			{ min: 45, max: 75, class: 'fill-yellow-500' },
			{ min: 75, max: 100, class: 'fill-orange-500' },
			{ min: 100, max: 120, class: 'fill-red-500' }
		];

		const majorTicks = Array.from({ length: 13 }, (_, i) => i * 10);
		const minorTicks = Array.from({ length: 25 }, (_, i) => i * 5).filter((t) => t % 10 !== 0);
		const needleAngleRad = $.derived(() => angleScale(speed) * Math.PI / 180);

		$$renderer.push(`<div class="flex flex-col items-center gap-2"><input type="range"${$.attr('min', 0)}${$.attr('max', 120)}${$.attr('value', speed)} class="w-48"/> `);

		Chart($$renderer, {
			height: 200,
			padding: 20,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Group($$renderer, {
							y: 20,
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(zones);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let zone = each_array[$$index];

									Arc($$renderer, {
										startAngle: angleScale(zone.min) * Math.PI / 180,
										endAngle: angleScale(zone.max) * Math.PI / 180,
										outerRadius,
										innerRadius,
										class: zone.class
									});
								}

								$$renderer.push(`<!--]--> `);

								Arc($$renderer, {
									value: 0,
									domain,
									range: angleRange,
									outerRadius,
									innerRadius,
									class: 'fill-none',
									track: { class: 'fill-none stroke-surface-content/5' }
								});

								$$renderer.push(`<!----> <!--[-->`);

								const each_array_1 = $.ensure_array_like(majorTicks);

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let tick = each_array_1[$$index_1];
									const angleDeg = angleScale(tick);
									const angleRad = angleDeg * Math.PI / 180;
									const tickInner = innerRadius - 12;
									const tickOuter = innerRadius - 2;
									const labelRadius = innerRadius - 20;

									Line($$renderer, {
										x1: Math.sin(angleRad) * tickInner,
										y1: -Math.cos(angleRad) * tickInner,
										x2: Math.sin(angleRad) * tickOuter,
										y2: -Math.cos(angleRad) * tickOuter,
										class: 'stroke-surface-content',
										strokeWidth: 2
									});

									$$renderer.push(`<!----> `);

									Text($$renderer, {
										x: Math.sin(angleRad) * labelRadius,
										y: -Math.cos(angleRad) * labelRadius,
										value: String(tick),
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										class: 'text-[9px] fill-surface-content/60 tabular-nums'
									});

									$$renderer.push(`<!---->`);
								}

								$$renderer.push(`<!--]--> <!--[-->`);

								const each_array_2 = $.ensure_array_like(minorTicks);

								for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
									let tick = each_array_2[$$index_2];
									const angleDeg = angleScale(tick);
									const angleRad = angleDeg * Math.PI / 180;
									const tickInner = innerRadius - 8;
									const tickOuter = innerRadius - 2;

									Line($$renderer, {
										x1: Math.sin(angleRad) * tickInner,
										y1: -Math.cos(angleRad) * tickInner,
										x2: Math.sin(angleRad) * tickOuter,
										y2: -Math.cos(angleRad) * tickOuter,
										class: 'stroke-surface-content/40',
										strokeWidth: 1
									});
								}

								$$renderer.push(`<!--]--> `);

								Line($$renderer, {
									x1: Math.sin(needleAngleRad()) * -10,
									y1: -Math.cos(needleAngleRad()) * -10,
									x2: Math.sin(needleAngleRad()) * (innerRadius - 10),
									y2: -Math.cos(needleAngleRad()) * (innerRadius - 10),
									class: 'stroke-red-500',
									strokeWidth: 2.5
								});

								$$renderer.push(`<!----> `);
								Circle($$renderer, { r: 5, class: 'fill-surface-content' });
								$$renderer.push(`<!----> `);

								Text($$renderer, {
									value: String(Math.round(speed)),
									textAnchor: 'middle',
									verticalAnchor: 'middle',
									dy: 28,
									class: 'text-2xl font-bold tabular-nums'
								});

								$$renderer.push(`<!----> `);

								Text($$renderer, {
									x: 0,
									y: 42,
									value: 'mph',
									textAnchor: 'middle',
									verticalAnchor: 'middle',
									class: 'text-[8px] fill-surface-content/50'
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
		$.bind_props($$props, { data: speed });
	});
}