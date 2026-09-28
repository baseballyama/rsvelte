import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/Inspect.svelte';
import { getContext } from 'svelte';

var root = $.from_html(`<div class="flex col"><h3 id="map-and-set">Map & Set</h3> <p><code>Inspect</code> handles map and set instances.</p> <!></div>`);

export default function MapAndSet($$anchor, $$props) {
	$.push($$props, true);
	getContext('toc')?.set('Map & Set', 'map-and-set');

	var div = root();
	var node = $.sibling($.child(div), 4);

	Inspect(node, {
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

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}