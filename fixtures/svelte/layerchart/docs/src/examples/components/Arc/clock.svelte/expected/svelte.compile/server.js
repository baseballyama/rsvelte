import * as $ from 'svelte/internal/server';
import { Chart, Circle, Group, Layer, Line, Text } from 'layerchart';

export default function Clock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let now = new Date();
		const hours = $.derived(() => now.getHours() % 12);
		const minutes = $.derived(() => now.getMinutes());
		const seconds = $.derived(() => now.getSeconds());

		// Angles in radians (clock: 12 o'clock = 0 degrees, clockwise)
		const secondAngleRad = $.derived(() => seconds() * 6 * Math.PI / 180);

		const minuteAngleRad = $.derived(() => (minutes() * 6 + seconds() * 0.1) * Math.PI / 180);
		const hourAngleRad = $.derived(() => (hours() * 30 + minutes() * 0.5) * Math.PI / 180);
		const hourMarkers = Array.from({ length: 12 }, (_, i) => i);
		const minuteMarkers = Array.from({ length: 60 }, (_, i) => i).filter((i) => i % 5 !== 0);
		const hourLabels = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

		Chart($$renderer, {
			height: 260,
			padding: 10,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Group($$renderer, {
							children: ($$renderer) => {
								Circle($$renderer, {
									r: 100,
									class: 'fill-surface-200 stroke-surface-content/20',
									strokeWidth: 2
								});

								$$renderer.push(`<!----> <!--[-->`);

								const each_array = $.ensure_array_like(minuteMarkers);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let i = each_array[$$index];
									const angleRad = i * 6 * Math.PI / 180;

									Line($$renderer, {
										x1: Math.sin(angleRad) * 90,
										y1: -Math.cos(angleRad) * 90,
										x2: Math.sin(angleRad) * 95,
										y2: -Math.cos(angleRad) * 95,
										class: 'stroke-surface-content/20',
										strokeWidth: 1
									});
								}

								$$renderer.push(`<!--]--> <!--[-->`);

								const each_array_1 = $.ensure_array_like(hourMarkers);

								for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
									let i = each_array_1[$$index_1];
									const angleRad = i * 30 * Math.PI / 180;

									Line($$renderer, {
										x1: Math.sin(angleRad) * 85,
										y1: -Math.cos(angleRad) * 85,
										x2: Math.sin(angleRad) * 95,
										y2: -Math.cos(angleRad) * 95,
										class: 'stroke-surface-content',
										strokeWidth: 2.5
									});
								}

								$$renderer.push(`<!--]--> <!--[-->`);

								const each_array_2 = $.ensure_array_like(hourLabels);

								for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
									let label = each_array_2[i];
									const angleRad = i * 30 * Math.PI / 180;

									Text($$renderer, {
										x: Math.sin(angleRad) * 75,
										y: -Math.cos(angleRad) * 75,
										value: String(label),
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										class: 'text-xs font-semibold fill-surface-content tabular-nums'
									});
								}

								$$renderer.push(`<!--]--> `);

								Line($$renderer, {
									x1: Math.sin(hourAngleRad()) * -8,
									y1: -Math.cos(hourAngleRad()) * -8,
									x2: Math.sin(hourAngleRad()) * 52,
									y2: -Math.cos(hourAngleRad()) * 52,
									class: 'stroke-surface-content',
									strokeWidth: 4
								});

								$$renderer.push(`<!----> `);

								Line($$renderer, {
									x1: Math.sin(minuteAngleRad()) * -10,
									y1: -Math.cos(minuteAngleRad()) * -10,
									x2: Math.sin(minuteAngleRad()) * 70,
									y2: -Math.cos(minuteAngleRad()) * 70,
									class: 'stroke-surface-content',
									strokeWidth: 2.5
								});

								$$renderer.push(`<!----> `);

								Line($$renderer, {
									x1: Math.sin(secondAngleRad()) * -14,
									y1: -Math.cos(secondAngleRad()) * -14,
									x2: Math.sin(secondAngleRad()) * 80,
									y2: -Math.cos(secondAngleRad()) * 80,
									class: 'stroke-red-500',
									strokeWidth: 1
								});

								$$renderer.push(`<!----> `);
								Circle($$renderer, { r: 4, class: 'fill-red-500' });
								$$renderer.push(`<!----> `);
								Circle($$renderer, { r: 2, class: 'fill-surface-content' });
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
	});
}