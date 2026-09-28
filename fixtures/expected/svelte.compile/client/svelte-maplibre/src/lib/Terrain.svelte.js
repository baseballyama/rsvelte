import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getMapContext } from './context.svelte.js';
import { onDestroy } from 'svelte';

export default function Terrain($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		loaded = $.derived(() => $.get($$d).loaded);

	let source = $.prop($$props, 'source', 3, undefined),
		exaggeration = $.prop($$props, 'exaggeration', 3, undefined);

	$.user_effect(() => {
		if (source() && $.get(loaded) && $.get(map)) {
			let specification = { source: source(), exaggeration: exaggeration() };

			$.get(map).setTerrain(specification);
		}
	});

	onDestroy(() => {
		if ($.get(loaded) && source() && $.get(map)) {
			$.get(map).setTerrain(null);
		}
	});

	$.pop();
}