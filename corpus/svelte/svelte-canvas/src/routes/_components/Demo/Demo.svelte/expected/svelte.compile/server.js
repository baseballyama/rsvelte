import * as $ from 'svelte/internal/server';
import { Canvas } from '$lib';
import Rect from './Rect.svelte';
import Circle from './Circle.svelte';
import Blob from './Blob.svelte';
import Text from './Text.svelte';
import Tooltip from './Tooltip.svelte';
import { coords, activeLayer } from './store';

export default function Demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		const touch = (e) => {
			const { left, top } = e.target.getBoundingClientRect();
			const { clientX, clientY } = e.changedTouches[0];

			$.store_set(coords, [clientX - left, clientY - top]);
		};

		$$renderer.push(`<div class="svelte-7096nr">`);

		Canvas($$renderer, {
			layerEvents: true,
			style: `cursor: ${$.store_get($$store_subs ??= {}, '$activeLayer', activeLayer) ? 'pointer' : 'default'}`,
			onpointermove: (e) => $.store_set(coords, [e.offsetX, e.offsetY]),
			ontouchstart: touch,
			ontouchmove: touch,
			children: ($$renderer) => {
				Rect($$renderer, {});
				$$renderer.push(`<!----> `);
				Blob($$renderer, {});
				$$renderer.push(`<!----> `);
				Circle($$renderer, {});
				$$renderer.push(`<!----> `);
				Text($$renderer, { text: 'svelte-canvas', yOffset: -0.03, scale: 0.06 });
				$$renderer.push(`<!----> `);

				Text($$renderer, {
					text: 'Reactive canvas components',
					scale: 0.0297,
					yOffset: 0.04,
					opacity: 0.7
				});

				$$renderer.push(`<!----> `);

				if ($.store_get($$store_subs ??= {}, '$activeLayer', activeLayer)?.id) {
					$$renderer.push('<!--[0-->');
					Tooltip($$renderer, {});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}