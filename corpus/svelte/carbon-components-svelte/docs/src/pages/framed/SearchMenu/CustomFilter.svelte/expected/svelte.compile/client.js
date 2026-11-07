import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SearchMenu, SearchMenuItem } from "carbon-components-svelte";

export default function CustomFilter($$anchor, $$props) {
	$.push($$props, true);

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

	SearchMenu($$anchor, {
		match,
		labelText: 'Search',
		placeholder: 'Search...',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 16, () => resources, (text) => text, ($$anchor, text) => {
				SearchMenuItem($$anchor, {
					get text() {
						return text;
					}
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}