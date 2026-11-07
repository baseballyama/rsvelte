import * as $ from 'svelte/internal/server';
import { createSheetObjectAction, useSequence } from '@threlte/theatre';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const sheetObjectAction = createSheetObjectAction();
		const { position, playing, pause, play } = useSequence();
		const toggle = () => $.store_get($$store_subs ??= {}, '$playing', playing) ? pause() : play();

		$$renderer.push(`<div class="svelte-awn0pb"><button class="svelte-awn0pb">Click Me!
    ${$.escape($.store_get($$store_subs ??= {}, '$position', position).toFixed(2))}</button></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}