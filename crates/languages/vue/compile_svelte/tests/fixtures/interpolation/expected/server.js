import * as $ from 'svelte/internal/server';

import { toDisplayString } from 'vue';

export default function Interpolation_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const object = { a: 1, b: [true, null] };
		const list = ['x', 'y'];
		const nothing = undefined;
		$$renderer.push(`<pre>${$.escape(toDisplayString(object))}</pre><p>${$.escape(toDisplayString(list))}</p><p>[${$.escape(toDisplayString(nothing))}] [${$.escape(toDisplayString(null))}]</p>`);
	});
}
