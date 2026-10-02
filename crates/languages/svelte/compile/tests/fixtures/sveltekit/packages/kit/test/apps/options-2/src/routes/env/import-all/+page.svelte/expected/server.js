import * as $ from 'svelte/internal/server';
import * as env from '$app/env/public';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<pre data-private="">${$.escape(JSON.stringify(data.env))}</pre> <pre data-public="">${$.escape(JSON.stringify(env))}</pre>`);
	});
}