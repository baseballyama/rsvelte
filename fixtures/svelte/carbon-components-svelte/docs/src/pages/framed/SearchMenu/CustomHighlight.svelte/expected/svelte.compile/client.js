import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SearchMenu, SearchMenuItem } from "carbon-components-svelte";

var root = $.from_html(`<mark class="svelte-2wesg7"> </mark>`);

export default function CustomHighlight($$anchor, $$props) {
	$.push($$props, true);

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
					},
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$anchor, $$slotProps) => {
							const segments = $.derived(() => $$slotProps.segments);
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.each(node_1, 17, () => $.get(segments), $.index, ($$anchor, segment) => {
								var fragment_4 = $.comment();
								var node_2 = $.first_child(fragment_4);

								{
									var consequent = ($$anchor) => {
										var mark = root();
										var text_1 = $.only_child(mark, true);

										$.template_effect(() => $.set_text(text_1, $.get(segment).text));
										$.append($$anchor, mark);
									};

									var alternate = ($$anchor) => {
										var text_2 = $.text();

										$.template_effect(() => $.set_text(text_2, $.get(segment).text));
										$.append($$anchor, text_2);
									};

									$.if(node_2, ($$render) => {
										if ($.get(segment).match) $$render(consequent); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_4);
							});

							$.append($$anchor, fragment_3);
						}
					}
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}