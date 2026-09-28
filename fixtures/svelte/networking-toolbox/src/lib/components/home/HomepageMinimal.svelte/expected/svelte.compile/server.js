import * as $ from 'svelte/internal/server';
import { site } from '$lib/constants/site';
import ToolsGrid from '$lib/components/global/ToolsGrid.svelte';
import SearchFilter from '$lib/components/furniture/SearchFilter.svelte';
import { useToolSearch } from '$lib/composables/useToolSearch.svelte';

export default function HomepageMinimal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { toolPages, referencePages } = $$props;
		const search = useToolSearch(() => [...toolPages, ...referencePages]);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<section class="hero-minimal svelte-10330cd"><h1 class="svelte-10330cd">${$.escape(site.title)}</h1></section> `);

			SearchFilter($$renderer, {
				get filteredTools() {
					return search.filtered;
				},

				set filteredTools($$value) {
					search.filtered = $$value;
					$$settled = false;
				},

				get searchQuery() {
					return search.query;
				},

				set searchQuery($$value) {
					search.query = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			ToolsGrid($$renderer, {
				idPrefix: 'minimal',
				tools: search.filtered,
				searchQuery: search.query
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}