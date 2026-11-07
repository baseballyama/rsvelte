import * as $ from 'svelte/internal/server';
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

export default function Accordion_demo_noTransition($$renderer) {
	Accordion($$renderer, {
		transitionDuration: 0,
		children: ($$renderer) => {
			if (Accordion.Item) {
				$$renderer.push('<!--[-->');

				Accordion.Item($$renderer, {
					value: 'typescript',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Build type safe applications. All SvelteUI packages are built with TypeScript and support it by default.
		All components and functions export types, are documented, and give developers autocomplete features!`);
					},

					$$slots: {
						default: true,
						control: ($$renderer) => {
							$$renderer.push(`<div slot="control">Typescript Based</div>`);
						}
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Accordion.Item) {
				$$renderer.push('<!--[-->');

				Accordion.Item($$renderer, {
					value: 'packed',
					children: ($$renderer) => {
						$$renderer.push(`<!---->SvelteUI contains more than just components. With Actions, Transitions, and Utilities available to
		you, development will be fun and easy!`);
					},

					$$slots: {
						default: true,
						control: ($$renderer) => {
							$$renderer.push(`<div slot="control">Feature packed</div>`);
						}
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Accordion.Item) {
				$$renderer.push('<!--[-->');

				Accordion.Item($$renderer, {
					value: 'accessible',
					children: ($$renderer) => {
						$$renderer.push(`<!---->All components are accessible according to WAI-ARIA standards. On top of that, no annoying focus
		ring. It will appear only when user navigates with keyboard.`);
					},

					$$slots: {
						default: true,
						control: ($$renderer) => {
							$$renderer.push(`<div slot="control">Accessible and usable</div>`);
						}
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}