import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Arc, ArcChart, Group, LinearGradient, Text } from 'layerchart';

export default function Gradient_with_text($$anchor) {
	{
		const marks = ($$anchor) => {
			{
				const children = ($$anchor, $$arg0) => {
					let gradient = () => ($$arg0?.()).gradient;

					Group($$anchor, {
						y: 20,
						children: ($$anchor, $$slotProps) => {
							{
								const children = ($$anchor, $$arg0) => {
									let value = () => ($$arg0?.()).value;

									{
										let $0 = $.derived(() => Math.round(value()) + '%');

										Text($$anchor, {
											get value() {
												return $.get($0);
											},
											textAnchor: 'middle',
											verticalAnchor: 'middle',
											class: 'text-4xl tabular-nums'
										});
									}
								};

								Arc($$anchor, {
									value: 70,
									domain: [0, 100],
									outerRadius: 80,
									innerRadius: -15,
									cornerRadius: 10,
									range: [-120, 120],
									get fill() {
										return gradient();
									},
									track: { class: 'fill-none stroke-surface-content/10' },
									children,
									$$slots: { default: true }
								});
							}
						},
						$$slots: { default: true }
					});
				};

				LinearGradient($$anchor, {
					class: 'from-secondary to-primary',
					children,
					$$slots: { default: true }
				});
			}
		};

		ArcChart($$anchor, { height: 140, marks, $$slots: { marks: true } });
	}
}