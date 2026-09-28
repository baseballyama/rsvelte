import * as $ from 'svelte/internal/server';
import { getMapContext } from './context.svelte.js';
import * as maplibregl from 'maplibre-gl';
import { onDestroy } from 'svelte';

export default function FullscreenControl($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const $$d = $.derived(getMapContext),
			map = $.derived(() => $$d().map),
			loaded = $.derived(() => $$d().loaded);

		let { position = 'top-left', container = undefined } = $$props;
		let control = void 0;

		let containerEl = $.derived(() => {
			if (typeof container === 'string') {
				return document.querySelector(container) ?? undefined;
			} else {
				return container;
			}
		});

		onDestroy(() => {
			if (loaded() && control) {
				map()?.removeControl(control);
			}
		});
	});
}