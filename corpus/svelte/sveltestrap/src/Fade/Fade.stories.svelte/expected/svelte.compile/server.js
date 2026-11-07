import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Button, Card } from '@sveltestrap/sveltestrap';
import Fade from './Fade.svelte';

export const meta = {
	title: 'Stories/Fade',
	component: Fade,
	parameters: {},
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		isOpen: { control: 'boolean' },
		toggler: { control: { disable: true } }
	},
	args: { isOpen: false }
};

export default function Fade_stories($$renderer) {
	let isOpen = false;
	let status = 'Closed';

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div class="fade-example">`);

				Button($$renderer, {
					color: 'primary',
					class: 'mb-3',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Toggle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Fade($$renderer, {
					isOpen,
					children: ($$renderer) => {
						$$renderer.push(`<div class="card-width">`);

						Card($$renderer, {
							body: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim
          keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Events',
		children: ($$renderer) => {
			$$renderer.push(`<div class="fade-example"><div class="text-content">`);

			Button($$renderer, {
				color: 'primary',
				class: 'mb-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Toggle`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <h5>Current state: ${$.escape(status)}</h5></div> `);

			Fade($$renderer, {
				isOpen,
				children: ($$renderer) => {
					$$renderer.push(`<div class="card-width">`);

					Card($$renderer, {
						body: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim
          keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Uncontrolled',
		children: ($$renderer) => {
			$$renderer.push(`<div class="fade-example">`);

			Button($$renderer, {
				color: 'primary',
				id: 'toggler',
				class: 'mb-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Toggle`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Fade($$renderer, {
				toggler: '#toggler',
				children: ($$renderer) => {
					$$renderer.push(`<div class="card-width">`);

					Card($$renderer, {
						body: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt magni, voluptas debitis similique porro a
          molestias consequuntur earum odio officiis natus, amet hic, iste sed dignissimos esse fuga! Minus, alias.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}