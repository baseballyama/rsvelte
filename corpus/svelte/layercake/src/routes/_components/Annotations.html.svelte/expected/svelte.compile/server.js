import * as $ from 'svelte/internal/server';
import { LayerCake, Html } from 'layercake';
import Annotations from '../../_components/Annotations.html.svelte';

export default function Annotations_html($$renderer) {
	const annotations = [
		{
			text: 'CSS-positioned annotation...',
			top: '10%',
			left: '15%'
		},
		{ text: '...and another one', right: '18%', bottom: '10%' }
	];

	$$renderer.push(`<div class="chart-container svelte-9pwkdj">`);

	LayerCake($$renderer, {
		padding: { top: 0, right: 0, bottom: 20, left: 20 },
		children: ($$renderer) => {
			Html($$renderer, {
				children: ($$renderer) => {
					Annotations($$renderer, { annotations });
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}