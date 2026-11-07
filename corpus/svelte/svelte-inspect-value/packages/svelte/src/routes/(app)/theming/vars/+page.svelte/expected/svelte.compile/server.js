import * as $ from 'svelte/internal/server';
import { createPageTitle } from '$doclib/util.js';
import vars from './vars-defaults.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$.head('bmkt69', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(createPageTitle('CSS Variables'))}</title>`);
			});
		});

		$$renderer.push(`<h2>CSS Variables</h2> <table class="svelte-bmkt69"><thead><tr><th class="svelte-bmkt69">Variable</th><th class="svelte-bmkt69">Default</th></tr></thead><tbody><!--[-->`);

		const each_array = $.ensure_array_like(vars);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let [v, def] = each_array[i];

			$$renderer.push(`<tr><td class="varname svelte-bmkt69">${$.escape(v)}</td><td class="svelte-bmkt69">${$.escape(def)}</td></tr>`);
		}

		$$renderer.push(`<!--]--></tbody></table>`);
	});
}