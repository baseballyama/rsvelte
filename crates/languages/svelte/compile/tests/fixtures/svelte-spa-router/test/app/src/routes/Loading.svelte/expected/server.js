import * as $ from 'svelte/internal/server';

export default function Loading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { params = null } = $$props;

		$$renderer.push(`<h2 class="routetitle">Loading</h2> <p id="pleasewait">Please wait…</p> `);

		if (params && params.message) {
			$$renderer.push(`<!--[0--><p id="loadingmessage">Message is ${$.escape(params.message)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}