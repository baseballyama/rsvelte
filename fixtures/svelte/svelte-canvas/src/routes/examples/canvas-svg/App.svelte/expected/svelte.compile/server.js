import * as $ from 'svelte/internal/server';
import { Canvas } from '$lib';
import { mesh, feature } from 'topojson-client';
import { geoIdentity, geoPath } from 'd3-geo';
import Bubble from './Bubble.svelte';
import us from 'us-atlas/states-albers-10m.json';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let width = 0;
		const projection = $.derived(() => geoIdentity().scale(width / 975));
		const path = $.derived(() => geoPath(projection()));

		const centroids = $.derived(() => us
			? feature(us, us.objects.states).features.map(path().centroid).sort(([a], [b]) => b - a)
			: []);

		$$renderer.push(`<div class="svelte-jgosct"><svg class="svelte-jgosct">`);

		if (us) {
			$$renderer.push(`<!--[0--><path${$.attr('d', path()(mesh(us, us.objects.states)))} class="svelte-jgosct"></path>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></svg> `);

		Canvas($$renderer, {
			onresize: (e) => width = e.width,
			style: 'position: absolute',
			autoplay: true,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(centroids());

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let [x, y] = each_array[i];

					Bubble($$renderer, { x, y, i });
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}