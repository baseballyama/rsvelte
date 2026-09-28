import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tab, TabContent, Tabs } from "carbon-components-svelte";
import Calendar from "carbon-icons-svelte/lib/Calendar.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p data-testid="tab-content-1">Content for tab 1</p>`);
var root_2 = $.from_html(`<p data-testid="tab-content-2">Content for tab 2</p>`);
var root_3 = $.from_html(`<p data-testid="tab-content-3">Content for tab 3</p>`);

export default function TabsFixture($$anchor) {
	let selected = 0;

	Tabs($$anchor, {
		'data-testid': 'tabs',
		get selected() {
			return selected;
		},

		set selected($$value) {
			selected = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Tab(node, {
				label: 'Tab 1',
				get icon() {
					return Calendar;
				}
			});

			var node_1 = $.sibling(node, 2);

			Tab(node_1, { label: 'Tab 2' });

			var node_2 = $.sibling(node_1, 2);

			Tab(node_2, { label: 'Tab 3' });
			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			content: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_3 = $.first_child(fragment_2);

				TabContent(node_3, {
					children: ($$anchor, $$slotProps) => {
						var p = root_1();

						$.append($$anchor, p);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				TabContent(node_4, {
					children: ($$anchor, $$slotProps) => {
						var p_1 = root_2();

						$.append($$anchor, p_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				TabContent(node_5, {
					children: ($$anchor, $$slotProps) => {
						var p_2 = root_3();

						$.append($$anchor, p_2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			}
		}
	});
}