import * as $ from 'svelte/internal/server';
import AllTypes from '$doclib/examples/AllTypes.svelte';
import Inspect from '$lib/Inspect.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div style="padding: 2em">`);

		AllTypes($$renderer, {
			seeFlashing: true,
			search: 'highlight',
			highlightMatches: true
		});

		$$renderer.push(`<!----></div> <div style="padding: 2em">`);
		Inspect($$renderer, { values: new Map([['b', 'a']]) });
		$$renderer.push(`<!----> `);
		Inspect($$renderer, { values: new Set(['b', 'a']) });
		$$renderer.push(`<!----> `);
		Inspect($$renderer, { values: new Uint16Array([1, 2, 3]) });
		$$renderer.push(`<!----></div>`);
	});
}