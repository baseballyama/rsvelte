import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getMapContext } from './context.svelte.js';
import * as maplibregl from 'maplibre-gl';
import { onDestroy } from 'svelte';

export default function FullscreenControl($$anchor, $$props) {
	$.push($$props, true);

	const $$d = $.derived(getMapContext),
		map = $.derived(() => $.get($$d).map),
		loaded = $.derived(() => $.get($$d).loaded);

	let position = $.prop($$props, 'position', 3, 'top-left'),
		container = $.prop($$props, 'container', 3, undefined);

	let control = $.state(void 0);

	let containerEl = $.derived(() => {
		if (typeof container() === 'string') {
			return document.querySelector(container()) ?? undefined;
		} else {
			return container();
		}
	});

	$.user_effect(() => {
		if ($.get(map) && !$.get(control)) {
			if ($.get(containerEl)) {
				$.set(control, new maplibregl.FullscreenControl({ container: $.get(containerEl) }), true);
			} else {
				$.set(control, new maplibregl.FullscreenControl(), true);
			}

			$.get(map).addControl($.get(control), position());
		}
	});

	onDestroy(() => {
		if ($.get(loaded) && $.get(control)) {
			$.get(map)?.removeControl($.get(control));
		}
	});

	$.pop();
}