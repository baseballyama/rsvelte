import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tabs } from '@svelteuidev/core';

const code = `<script>
	import { Tabs } from '@svelteuidev/core';
<\/script>

<Tabs>
    <Tabs.Tab label="First" title="Reveal hidden truth on long mouse over">
        First tab content
    </Tabs.Tab>
    <Tabs.Tab label="Not allowed" disabled>
        https://youtu.be/dQw4w9WgXcQ
    </Tabs.Tab>
    <Tabs.Tab label="Delete this?" color="red" override={{ fontWeight: 500 }}>
        Yes, delete this
    </Tabs.Tab>
</Tabs>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Tabs_demo_component($$anchor) {
	Tabs($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tabs.Tab, ($$anchor, Tabs_Tab) => {
				Tabs_Tab($$anchor, {
					label: 'First',
					title: 'Reveal hidden truth on long mouse over',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('First tab content');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Tabs.Tab, ($$anchor, Tabs_Tab_1) => {
				Tabs_Tab_1($$anchor, {
					label: 'Not allowed',
					disabled: true,
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('https://youtu.be/dQw4w9WgXcQ');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Tabs.Tab, ($$anchor, Tabs_Tab_2) => {
				Tabs_Tab_2($$anchor, {
					label: 'Delete this?',
					color: 'red',
					override: { backgroundColor: 'red' },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Yes, delete this');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}