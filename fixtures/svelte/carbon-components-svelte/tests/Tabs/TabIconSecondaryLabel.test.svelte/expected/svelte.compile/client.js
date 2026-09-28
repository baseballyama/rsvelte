import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tab from "carbon-components-svelte/Tabs/Tab.svelte";
import TabContent from "carbon-components-svelte/Tabs/TabContent.svelte";
import Tabs from "carbon-components-svelte/Tabs/Tabs.svelte";
import Calendar from "../../src/icons/Calendar.svelte";
import Information from "../../src/icons/Information.svelte";
import Settings from "../../src/icons/Settings.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function TabIconSecondaryLabel_test($$anchor) {
	Tabs($$anchor, {
		type: 'container',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Tab(node, {
				label: 'Calendar',
				get icon() {
					return Calendar;
				},
				secondaryLabel: '(12 events)'
			});

			var node_1 = $.sibling(node, 2);

			Tab(node_1, {
				label: 'Information',
				get icon() {
					return Information;
				},
				secondaryLabel: '(3 new)'
			});

			var node_2 = $.sibling(node_1, 2);

			Tab(node_2, {
				label: 'Settings',
				get icon() {
					return Settings;
				},
				secondaryLabel: '(2 pending)',
				disabled: true
			});

			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			content: ($$anchor, $$slotProps) => {
				var fragment_2 = root();
				var node_3 = $.first_child(fragment_2);

				TabContent(node_3, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Calendar content');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				TabContent(node_4, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Information content');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				TabContent(node_5, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Settings content');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			}
		}
	});
}