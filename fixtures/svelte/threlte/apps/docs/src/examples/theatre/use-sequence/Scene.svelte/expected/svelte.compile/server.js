import * as $ from 'svelte/internal/server';
import { T } from '@threlte/core';
import { Environment, Text, interactivity } from '@threlte/extras';
import { useSequence } from '@threlte/theatre';
import Feather from './Feather.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		interactivity();

		const { position, config, play } = useSequence();

		// adjust playback settings
		config({ iterationCount: Infinity, rate: 0.3 });

		const format = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
		let time = $.derived(() => format($.store_get($$store_subs ??= {}, '$position', position)));

		play();
		Feather($$renderer, {});
		$$renderer.push(`<!----> `);
		Text($$renderer, { 'position.x': 1, text: time() });
		$$renderer.push(`<!----> `);

		if (T.PerspectiveCamera) {
			$$renderer.push('<!--[-->');
			T.PerspectiveCamera($$renderer, { 'position.z': 2, makeDefault: true });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		if (T.AmbientLight) {
			$$renderer.push('<!--[-->');
			T.AmbientLight($$renderer, { intensity: 0.2 });
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(` `);

		Environment($$renderer, {
			url: '/textures/equirectangular/hdr/industrial_sunset_puresky_1k.hdr',
			isBackground: true
		});

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}