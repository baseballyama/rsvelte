import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tab from "carbon-components-svelte/Tabs/Tab.svelte";
import TabContent from "carbon-components-svelte/Tabs/TabContent.svelte";
import Tabs from "carbon-components-svelte/Tabs/Tabs.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function TabsAllDisabled_test($$anchor) {
	Tabs($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Tab(node, { label: 'Tab 1', disabled: true });

			var node_1 = $.sibling(node, 2);

			Tab(node_1, { label: 'Tab 2', disabled: true });

			var node_2 = $.sibling(node_1, 2);

			Tab(node_2, { label: 'Tab 3', disabled: true });
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

						var text = $.text('Content 1');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node_3, 2);

				TabContent(node_4, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Content 2');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				TabContent(node_5, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Content 3');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_2);
			}
		}
	});
}