import * as $ from 'svelte/internal/server';
import { Arc, ArcChart, Group, LinearGradient, Text } from 'layerchart';

export default function Gradient_with_text($$renderer) {
	{
		function marks($$renderer) {
			{
				function children($$renderer, { gradient }) {
					Group($$renderer, {
						y: 20,
						children: ($$renderer) => {
							{
								function children($$renderer, { value }) {
									Text($$renderer, {
										value: Math.round(value) + '%',
										textAnchor: 'middle',
										verticalAnchor: 'middle',
										class: 'text-4xl tabular-nums'
									});
								}

								Arc($$renderer, {
									value: 70,
									domain: [0, 100],
									outerRadius: 80,
									innerRadius: -15,
									cornerRadius: 10,
									range: [-120, 120],
									fill: gradient,
									track: { class: 'fill-none stroke-surface-content/10' },
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				}

				LinearGradient($$renderer, {
					class: 'from-secondary to-primary',
					children,
					$$slots: { default: true }
				});
			}
		}

		ArcChart($$renderer, { height: 140, marks, $$slots: { marks: true } });
	}
}