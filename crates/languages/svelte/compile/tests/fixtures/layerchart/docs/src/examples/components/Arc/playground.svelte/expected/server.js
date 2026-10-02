import * as $ from 'svelte/internal/server';
import { Arc, Chart, LinearGradient, Text, Layer } from 'layerchart';
import ArcPlaygroundControls from '$lib/components/controls/ArcPlaygroundControls.svelte';

export default function Playground($$renderer) {
	let config = {
		show: false,
		value: 60,
		spring: true,
		domain: [0, 100],
		range: [-90, 90],
		innerRadius: 70,
		outerRadius: 140,
		cornerRadius: 8,
		padAngle: 0,
		outerText: 'Outer Text',
		innerText: 'Inner Text',
		centroidText: 'Centroid Text',
		textSize: 16
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ArcPlaygroundControls($$renderer, {
			get config() {
				return config;
			},

			set config($$value) {
				config = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Chart($$renderer, {
			height: 350,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						if (config.show) {
							$$renderer.push(`<!--[0--><!---->`);

							{
								{
									function children($$renderer, { gradient }) {
										{
											function children($$renderer, { value, getArcTextProps }) {
												Text($$renderer, {
													value: Math.round(value),
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'text-4xl',
													dy: 8
												});

												$$renderer.push(`<!----> `);

												Text($$renderer, $.spread_props([
													getArcTextProps('inner'),
													{
														value: config.innerText,
														fontSize: config.textSize,
														truncate: true
													}
												]));

												$$renderer.push(`<!----> `);

												Text($$renderer, $.spread_props([
													getArcTextProps('outer'),
													{
														value: config.outerText,
														fontSize: config.textSize,
														truncate: true
													}
												]));

												$$renderer.push(`<!----> `);

												Text($$renderer, $.spread_props([
													getArcTextProps('middle'),
													{
														value: config.centroidText,
														fontSize: config.textSize,
														class: 'fill-black',
														truncate: true
													}
												]));

												$$renderer.push(`<!---->`);
											}

											Arc($$renderer, {
												value: config.value,
												domain: config.domain,
												range: config.range,
												innerRadius: config.innerRadius,
												outerRadius: config.outerRadius,
												cornerRadius: config.cornerRadius,
												padAngle: config.padAngle,
												motion: config.spring ? 'spring' : undefined,
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
							}

							$$renderer.push(`<!---->`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}