import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Button, Text, Stack } from '@svelteuidev/core';
import { useDebounce } from './index';

export default function Use_debounce_stories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let updated = 0;
		let clicked = 0;

		const debouncedFn = useDebounce(
			() => {
				updated += 1;
			},
			1000
		);

		const clickedFn = () => {
			clicked += 1;
			debouncedFn();
		};

		Meta($$renderer, { title: 'Composables/use-debounce' });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					Stack($$renderer, {
						align: 'center',
						children: ($$renderer) => {
							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Smash me!`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								root: 'note',
								size: 'sm',
								children: ($$renderer) => {
									$$renderer.push(`<!---->Delay is set to 1000ms for this demo.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Button clicked: ${$.escape(clicked)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Text($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Event handler called: ${$.escape(updated)}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'use-debounce', id: 'useDebounceStory' });
		$$renderer.push(`<!---->`);
	});
}