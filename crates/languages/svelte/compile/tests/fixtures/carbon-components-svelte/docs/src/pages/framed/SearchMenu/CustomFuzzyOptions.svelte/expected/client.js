import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fuzzyMatch, SearchMenu, SearchMenuItem } from "carbon-components-svelte";

export default function CustomFuzzyOptions($$anchor, $$props) {
	$.push($$props, true);

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