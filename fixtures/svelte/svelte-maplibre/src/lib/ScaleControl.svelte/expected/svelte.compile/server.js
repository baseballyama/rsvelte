import * as $ from 'svelte/internal/server';
import { getMapContext } from './context.svelte.js';
import * as maplibregl from 'maplibre-gl';
import { onDestroy } from 'svelte';

export default function ScaleControl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			loaded = $.derived(() => $$d().loaded);

		let {
			position = 'bottom-left',
			maxWidth = undefined,
			unit = 'metric'
		} = $$props;

		let control = void 0;

		onDestroy(() => {
			if (loaded() && control) {
				map()?.removeControl(control);
			}
		});
	});
}