import * as $ from 'svelte/internal/server';
import Inspect from '$lib/Inspect.svelte';
import { getContext } from 'svelte';

export default function MapAndSet($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		getContext('toc')?.set('Map & Set', 'map-and-set');
		$$renderer.push(`<div class="flex col"><h3 id="map-and-set">Map &amp; Set</h3> <p><code>Inspect</code> handles map and set instances.</p> `);

		Inspect($$renderer, {
			style: 'width: 500px',
			value: {
				map: new Map([
					['yeah', 1],
					[3, 2],
					[{ name: 'object key' }, 3],
					[[1, 2], 3],
					[Symbol('1'), 4],
					[/r(e+)gExp?/, 'regex key']
				]),
				set: new Set([1, 2, 3, 'four'])
			},
			name: 'mapAndSet'
		});

		$$renderer.push(`<!----></div>`);
	});
}