import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SearchMenu, SearchMenuGroup, SearchMenuItem } from "carbon-components-svelte";
import Time from "carbon-icons-svelte/lib/Time.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<button type="button" data-testid="outside-target">Outside target</button> <!> <div data-testid="last-select"> </div> <div data-testid="last-submit"> </div>`, 1);

export default function SearchMenuFixture($$anchor) {
	let value = "";
	let lastSelect = "";
	let lastSubmit = "";

	const results = [
		"Databases for TestSQL",
		"AT&T IoT Data Plans",
		"Data Store for Memcache",
		"HazardHub Property Risk Data API"
	];

	var fragment = root_1();
	var node = $.sibling($.first_child(fragment), 2);

	SearchMenu(node, {
		'data-testid': 'search-input',
		labelText: 'Search',
		placeholder: 'Search...',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		},

		$$events: {
			select: (e) => lastSelect = e.detail.value,
			submit: (e) => lastSubmit = e.detail.value
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			SearchMenuGroup(node_1, {
				label: 'Recent searches',
				filter: false,
				children: ($$anchor, $$slotProps) => {
					SearchMenuItem($$anchor, {
						text: 'recent vpc',
						get icon() {
							return Time;
						}
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			SearchMenuGroup(node_2, {
				label: 'Results',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_3 = $.first_child(fragment_3);

					$.each(node_3, 16, () => results, (text) => text, ($$anchor, text) => {
						SearchMenuItem($$anchor, {
							get text() {
								return text;
							}
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_2, 2);

			SearchMenuGroup(node_4, {
				divider: true,
				children: ($$anchor, $$slotProps) => {
					SearchMenuItem($$anchor, { persistent: true, text: 'Carbon docs', href: '#carbon-docs' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var text_1 = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var text_2 = $.only_child(div_1, true);

	$.template_effect(() => {
		$.set_text(text_1, lastSelect);
		$.set_text(text_2, lastSubmit);
	});

	$.append($$anchor, fragment);
}