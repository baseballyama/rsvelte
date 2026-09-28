import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion } from '@svelteuidev/core';

const code = `<script>
  import { Accordion } from '@svelteuidev/core';
<\/script>

<Accordion transitionDuration={0}>
  <Accordion.Item value="typescript">
    <div slot="control">Typescript Based</div>
    ...
  </Accordion.Item>
  <Accordion.Item value="packed">
    <div slot="control">Feature packed</div>
    ...
  </Accordion.Item>
  <Accordion.Item value="accessible">
    <div slot="control">Accessible and usable</div>
    ...
  </Accordion.Item>
</Accordion>`;

export const type = 'demo';
export const configuration = { code, toggle: true };

var root = $.from_html(`<div slot="control">Typescript Based</div>`);
var root_1 = $.from_html(`<div slot="control">Feature packed</div>`);
var root_2 = $.from_html(`<div slot="control">Accessible and usable</div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);

export default function Accordion_demo_noTransition($$anchor) {
	Accordion($$anchor, {
		transitionDuration: 0,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_3();
			var node = $.first_child(fragment_1);

			$.component(node, () => Accordion.Item, ($$anchor, Accordion_Item) => {
				Accordion_Item($$anchor, {
					value: 'typescript',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Build type safe applications. All SvelteUI packages are built with TypeScript and support it by default.\n		All components and functions export types, are documented, and give developers autocomplete features!');

						$.append($$anchor, text);
					},

					$$slots: {
						default: true,
						control: ($$anchor, $$slotProps) => {
							var div = root();

							$.append($$anchor, div);
						}
					}
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => Accordion.Item, ($$anchor, Accordion_Item_1) => {
				Accordion_Item_1($$anchor, {
					value: 'packed',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('SvelteUI contains more than just components. With Actions, Transitions, and Utilities available to\n		you, development will be fun and easy!');

						$.append($$anchor, text_1);
					},

					$$slots: {
						default: true,
						control: ($$anchor, $$slotProps) => {
							var div_1 = root_1();

							$.append($$anchor, div_1);
						}
					}
				});
			});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item_2) => {
				Accordion_Item_2($$anchor, {
					value: 'accessible',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('All components are accessible according to WAI-ARIA standards. On top of that, no annoying focus\n		ring. It will appear only when user navigates with keyboard.');

						$.append($$anchor, text_2);
					},

					$$slots: {
						default: true,
						control: ($$anchor, $$slotProps) => {
							var div_2 = root_2();

							$.append($$anchor, div_2);
						}
					}
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}