import * as $ from 'svelte/internal/server';
import { Arc, Chart, LinearGradient, Text, Layer } from 'layerchart';

export default function Label_direction($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = 60;
		let domain = [0, 100];
		let cornerRadius = 8;
		let outerText = 'Outer Text';
		let innerText = 'Inner Text';
		let centroidText = 'Centroid Text';

		const labelExamples = [
			{ label: 'Top CW', range: [-90, 90] },
			{ label: 'Top CCW', range: [90, -90] },
			{ label: 'Bottom CW', range: [-270, -90] },
			{ label: 'Bottom CCW', range: [-90, -270] },
			{ label: 'Left CW', range: [-180, 0] },
			{ label: 'Left CCW', range: [0, -180] },
			{ label: 'Right CW', range: [0, 180] },
			{ label: 'Right CCW', range: [180, 0] }
		];

		const data = { value, labelExamples };

		$$renderer.push(`<div class="grid grid-cols-4 gap-2 mb-2"><!--[-->`);

		const each_array = $.ensure_array_like(labelExamples);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let example = each_array[$$index];

			$$renderer.push(`<div class="px-4 py-1 border rounded-sm">`);

			Chart($$renderer, {
				height: 300,
				children: ($$renderer) => {
					Layer($$renderer, {
						center: true,
						children: ($$renderer) => {
							{
								function children($$renderer, { gradient }) {
									{
										function children($$renderer, { getArcTextProps, getTrackTextProps }) {
											Text($$renderer, {
												value: example.label,
												textAnchor: 'middle',
												verticalAnchor: 'middle',
												class: 'text-xs',
												dy: -8
											});

											$$renderer.push(`<!----> `);

											Text($$renderer, {
												value: example.range.map((r) => r + '°').join(', '),
												textAnchor: 'middle',
												verticalAnchor: 'middle',
												class: 'text-xs',
												dy: 8
											});

											$$renderer.push(`<!----> `);

											Text($$renderer, $.spread_props([
												getArcTextProps('inner'),
												{ value: innerText, fontSize: 12, truncate: true }
											]));

											$$renderer.push(`<!----> `);

											Text($$renderer, $.spread_props([
												getArcTextProps('outer'),
												{ value: outerText, fontSize: 12, truncate: true }
											]));

											$$renderer.push(`<!----> `);

											Text($$renderer, $.spread_props([
												getArcTextProps('middle'),
												{
													value: centroidText,
													fontSize: 12,
													class: 'fill-black',
													truncate: true
												}
											]));

											$$renderer.push(`<!---->`);
										}

										Arc($$renderer, {
											value,
											domain,
											range: example.range,
											cornerRadius,
											innerRadius: 0.5,
											fill: gradient,
											track: { class: 'fill-surface-content/5' },
											children,
											$$slots: { default: true }
										});
									}
								}

								LinearGradient($$renderer, {
									class: 'from-secondary to-primary',
									vertical: true,
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { data });
	});
}