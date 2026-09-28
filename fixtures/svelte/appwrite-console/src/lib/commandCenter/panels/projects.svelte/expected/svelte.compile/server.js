import * as $ from 'svelte/internal/server';
import { initSearcher } from '../commands';
import { projectsSearcher } from '../searchers';
import Template from './template.svelte';

export default function Projects($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { search, results } = initSearcher(projectsSearcher);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Template($$renderer, {
				options: $.store_get($$store_subs ??= {}, '$results', results),
				get search() {
					return $.store_get($$store_subs ??= {}, '$search', search);
				},

				set search($$value) {
					$.store_set(search, $$value);
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}