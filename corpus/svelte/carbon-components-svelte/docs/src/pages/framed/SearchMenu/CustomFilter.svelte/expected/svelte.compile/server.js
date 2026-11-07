import * as $ from 'svelte/internal/server';
import { SearchMenu, SearchMenuItem } from "carbon-components-svelte";

export default function CustomFilter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "data";

		const resources = [
			"Databases for TestSQL",
			"AT&T IoT Data Plans",
			"Data Store for Memcache",
			"HazardHub Property Risk Data API",
			"Managed Financial Data API"
		];

		// Custom prefix matcher: only items whose text starts with the query match.
		// `matched` filters items out; `indices` are the characters to highlight.
		function match(text, query) {
			const q = query.trim().toLowerCase();

			if (q === "") return { matched: true, indices: [] };

			const matched = text.toLowerCase().startsWith(q);

			return {
				matched,
				indices: matched ? Array.from({ length: q.length }, (_, i) => i) : []
			};
		}

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