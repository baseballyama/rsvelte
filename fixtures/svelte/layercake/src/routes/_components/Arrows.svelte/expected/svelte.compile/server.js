import * as $ from 'svelte/internal/server';
import { LayerCake, Svg, Html } from 'layercake';
import Annotations from '../../_components/Annotations.html.svelte';
import Arrows from '../../_components/Arrows.svelte';
import ArrowheadMarker from '../../_components/ArrowheadMarker.svelte';

export default function Arrows_1($$renderer) {
	const annotations = [
		{
			text: 'Arrows...',
			top: '18%',
			left: '30%',
			arrows: [
				{
					clockwise: false, // true or false, defaults to true
					source: {
						anchor: 'left-bottom', // can be `{left, middle, right},{top-middle-bottom}`
						dx: -2,
						dy: -7
					},
					target: { x: '28%', y: '75%' }
				},

				{
					source: { anchor: 'right-bottom', dy: -7, dx: 5 },
					target: { x: '68%', y: '48%' }
				}
			]
		}
	];

	$$renderer.push(`<div class="chart-container svelte-jjw7za">`);

	LayerCake($$renderer, {
		children: ($$renderer) => {
			Html($$renderer, {
				children: ($$renderer) => {
					Annotations($$renderer, { annotations });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function defs($$renderer) {
					ArrowheadMarker($$renderer, {});
				}

				Svg($$renderer, {
					defs,
					children: ($$renderer) => {
						Arrows($$renderer, { annotations });
					},
					$$slots: { defs: true, default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}