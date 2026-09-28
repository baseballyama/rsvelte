import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Stack, NativeSelect, TextInput } from '@svelteuidev/core';
import { Modal } from './index';
import { Button } from '../Button';

export default function Modal_stories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let opened = false;

		function toggleOpen() {
			opened = !opened;
		}

		function handleClose() {
			opened = false;
		}

		const content = Array(100).fill(0).map((_, index) => 'Svelte is a complier');

		Meta($$renderer, { title: 'Components/Modal', component: Modal });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Click Me`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Modal($$renderer, $.spread_props([
						{ opened },
						args,
						{
							children: ($$renderer) => {
								Stack($$renderer, {
									children: ($$renderer) => {
										TextInput($$renderer, {
											autofocus: true,
											placeholder: 'Your name',
											label: 'Full name'
										});

										$$renderer.push(`<!----> `);

										NativeSelect($$renderer, {
											data: ['Svelte', 'React', 'Vue', 'Angular', 'Solid'],
											placeholder: 'Pick one',
											label: 'Select your favorite framework/library',
											description: 'This is anonymous'
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						}
					]));

					$$renderer.push(`<!---->`);
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Modal', id: 'modalStory' });
		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'With Overflow',
			id: 'modalOverflowStory',
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Click Me`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Modal($$renderer, {
					opened,
					overflow: 'inside',
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(content);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let _ = each_array[$$index];

							$$renderer.push(`<p>${$.escape(_)}</p>`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}