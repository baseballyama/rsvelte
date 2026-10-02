import * as $ from 'svelte/internal/server';
import { Arc, Chart, Group, Layer, LinearGradient, Text } from 'layerchart';
import ArcControls from '$lib/components/controls/ArcControls.svelte';

export default function Partial_arc($$renderer, $$props) {
	let value = 75;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ArcControls($$renderer, {
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Chart($$renderer, {
			height: 120,
			padding: 20,
			children: ($$renderer) => {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						Group($$renderer, {
							y: 16,
							children: ($$renderer) => {
								{
									function children($$renderer, { gradient }) {
										{
											function children($$renderer, { value }) {
												Text($$renderer, {
													value: Math.round(value) + '%',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'text-3xl tabular-nums'
												});
											}

											Arc($$renderer, {
												value,
												range: [-120, 120],
												outerRadius: 60,
												innerRadius: 50,
												cornerRadius: 5,
												motion: 'spring',
												fill: gradient,
												track: { class: 'fill-none stroke-surface-content/10' },
												children,
												$$slots: { default: true }
											});
										}
									}

									LinearGradient($$renderer, {
										class: 'from-secondary to-primary',
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
	$.bind_props($$props, { data: value });
}