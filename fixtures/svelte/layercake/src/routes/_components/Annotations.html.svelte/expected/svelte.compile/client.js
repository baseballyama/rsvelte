import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LayerCake, Html } from 'layercake';
import Annotations from '../../_components/Annotations.html.svelte';

var root = $.from_html(`<div class="chart-container svelte-9pwkdj"><!></div>`);

export default function Annotations_html($$anchor) {
	const annotations = [
		{
			text: 'CSS-positioned annotation...',
			top: '10%',
			left: '15%'
		},
		{ text: '...and another one', right: '18%', bottom: '10%' }
	];

	var div = root();
	var node = $.child(div);

	LayerCake(node, {
		padding: { top: 0, right: 0, bottom: 20, left: 20 },
		children: ($$anchor, $$slotProps) => {
			Html($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Annotations($$anchor, {
						get annotations() {
							return annotations;
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}