import * as $ from 'svelte/internal/server';
import { Arc, Chart, Layer, Tooltip, radiansToDegrees } from 'layerchart';
import { round } from '@layerstack/utils';

export default function Color_wheel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// color wheel
		const layerCount = 6;

		const divisions = 12;

		function wheelSegmentColor(startAngle, // in radians
		 layer, type = 'alpha') {
			const angle = Math.round(radiansToDegrees(startAngle));

			switch (type) {
				case 'saturation':
					return `hsla(${angle}, ${Math.round(layer / layerCount * 100)}%, 50%, 1)`;

				case 'lightness':
					return `hsla(${angle}, 100%, ${100 - 10 * layer}%, 1)`;

				case 'alpha':
					return `hsla(${angle}, 100%, 50%, ${round(layer / layerCount, 2)})`;
			}
		}

		const data = { layerCount, divisions };

		{
			function children($$renderer, { context }) {
				Layer($$renderer, {
					center: true,
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like({ length: layerCount });

						for (let layerIndex = 0, $$length = each_array.length; layerIndex < $$length; layerIndex++) {
							let _ = each_array[layerIndex];
							const layer = layerIndex + 1;

							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like({ length: divisions });

							for (let segmentIndex = 0,
								$$length = each_array_1.length; segmentIndex < $$length; segmentIndex++) {
								let _ = each_array_1[segmentIndex];
								const segmentAngle = 2 * Math.PI / divisions;
								const startAngle = segmentIndex * segmentAngle;
								const endAngle = (segmentIndex + 1) * segmentAngle;
								const color = wheelSegmentColor(startAngle, layer);

								Arc($$renderer, {
									startAngle,
									endAngle,
									outerRadius: layer / layerCount,
									innerRadius: -20,
									cornerRadius: 4,
									padAngle: 0.02,
									fill: color,
									class: 'hover:scale-90 origin-center [transform-box:fill-box] transition-transform',
									onpointermove: (e) => context.tooltip.show(e, color),
									onpointerleave: () => context.tooltip.hide()
								});
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { data }) {
						$$renderer.push(`<!---->${$.escape(data)}`);
					}

					if (Tooltip.Root) {
						$$renderer.push('<!--[-->');
						Tooltip.Root($$renderer, { children, $$slots: { default: true } });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}
			}

			Chart($$renderer, {
				height: 300,
				padding: 20,
				children,
				$$slots: { default: true }
			});
		}

		$.bind_props($$props, { data });
	});
}