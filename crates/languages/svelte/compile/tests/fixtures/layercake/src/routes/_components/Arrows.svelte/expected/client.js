import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Svg, Html } from 'layercake';
import Annotations from '../../_components/Annotations.html.svelte';
import Arrows from '../../_components/Arrows.svelte';
import ArrowheadMarker from '../../_components/ArrowheadMarker.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="chart-container svelte-jjw7za"><!></div>`);

export default function Arrows_1($$anchor) {
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

	var div = root_1();
	var node = $.child(div);

	LayerCake(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Html(node_1, {
				children: ($$anchor, $$slotProps) => {
					Annotations($$anchor, {
						get annotations() {
							return annotations;
						}
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			{
				const defs = ($$anchor) => {
					ArrowheadMarker($$anchor, {});
				};

				Svg(node_2, {
					defs,
					children: ($$anchor, $$slotProps) => {
						Arrows($$anchor, {
							get annotations() {
								return annotations;
							}
						});
					},
					$$slots: { defs: true, default: true }
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}