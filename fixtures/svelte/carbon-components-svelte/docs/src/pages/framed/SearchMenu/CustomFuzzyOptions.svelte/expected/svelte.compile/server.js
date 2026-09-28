import * as $ from 'svelte/internal/server';
import { fuzzyMatch, SearchMenu, SearchMenuItem } from "carbon-components-svelte";

export default function CustomFuzzyOptions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "Data";

		const resources = [
			"Data Table",
			"Data Store for Memcache",
			"Databases for TestSQL",
			"AT&T IoT Data Plans"
		];

		// Reuse the built-in matcher, but raise the sensitivity threshold. A
		// `threshold` of 0.5 requires a contiguous substring, so a scattered
		// subsequence like "dt" (which the default fuzzy matching accepts for
		// "Data Table") no longer matches.
		const match = (text, query) => fuzzyMatch(text, query, { threshold: 0.5 });

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			SearchMenu($$renderer, {
				match,
				labelText: 'Search',
				placeholder: 'Search...',
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				},

				children: ($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array = $.ensure_array_like(resources);

					for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
						let text = each_array[$$index];

						SearchMenuItem($$renderer, { text });
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}