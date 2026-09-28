import * as $ from 'svelte/internal/server';
import { SearchMenu, SearchMenuItem } from "carbon-components-svelte";

export default function CustomHighlight($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "data";

		const resources = [
			"Databases for TestSQL",
			"AT&T IoT Data Plans",
			"Data Store for Memcache",
			"HazardHub Property Risk Data API",
			"Managed Financial Data API"
		];

		// Custom matcher: a case-insensitive substring match.
		function match(text, query) {
			const q = query.trim().toLowerCase();

			if (q === "") return { matched: true, indices: [] };

			const start = text.toLowerCase().indexOf(q);

			if (start === -1) return { matched: false, indices: [] };

			return {
				matched: true,
				indices: Array.from({ length: q.length }, (_, i) => start + i)
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

					for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
						let text = each_array[$$index_1];

						SearchMenuItem($$renderer, {
							text,
							children: $.invalid_default_snippet,
							$$slots: {
								default: ($$renderer, { segments }) => {
									$$renderer.push(`<!--[-->`);

									const each_array_1 = $.ensure_array_like(segments);

									for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
										let segment = each_array_1[$$index];

										if (segment.match) {
											$$renderer.push(`<!--[0--><mark class="svelte-2wesg7">${$.escape(segment.text)}</mark>`);
										} else {
											$$renderer.push(`<!--[-1-->${$.escape(segment.text)}`);
										}

										$$renderer.push(`<!--]-->`);
									}

									$$renderer.push(`<!--]-->`);
								}
							}
						});
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