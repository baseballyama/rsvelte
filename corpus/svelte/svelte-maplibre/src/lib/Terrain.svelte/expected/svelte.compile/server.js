import * as $ from 'svelte/internal/server';
import { getMapContext } from './context.svelte.js';
import { onDestroy } from 'svelte';

export default function Terrain($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			loaded = $.derived(() => $$d().loaded);

		let { source = undefined, exaggeration = undefined } = $$props;

		onDestroy(() => {
			if (loaded() && source && map()) {
				map().setTerrain(null);
			}
		});
	});
}