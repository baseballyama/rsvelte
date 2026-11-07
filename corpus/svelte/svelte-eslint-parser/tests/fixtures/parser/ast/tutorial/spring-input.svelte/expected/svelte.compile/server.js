import * as $ from 'svelte/internal/server';
import { spring } from 'svelte/motion';

export default function Spring_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let coords = spring({ x: 50, y: 50 }, { stiffness: 0.1, damping: 0.25 });
		let size = spring(10);

		$$renderer.push(`<div style="position: absolute; right: 1em;"><label><h3>stiffness (${$.escape(coords.stiffness)})</h3> <input${$.attr('value', coords.stiffness)} type="range" min="0" max="1" step="0.01"/></label> <label><h3>damping (${$.escape(coords.damping)})</h3> <input${$.attr('value', coords.damping)} type="range" min="0" max="1" step="0.01"/></label></div> <svg class="svelte-1qldjtf"><circle${$.attr('cx', $.store_get($$store_subs ??= {}, '$coords', coords).x)}${$.attr('cy', $.store_get($$store_subs ??= {}, '$coords', coords).y)}${$.attr('r', $.store_get($$store_subs ??= {}, '$size', size))} class="svelte-1qldjtf"></circle></svg>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}