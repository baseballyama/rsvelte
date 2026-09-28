import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Input } from './index';
import { EnvelopeClosed } from 'radix-icons-svelte';
import { Button } from '../Button';

export default function Input_stories($$renderer) {
	let value = 'Hello';
	let valueNumber = 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Meta($$renderer, { title: 'Components/Input', component: Input });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					Input($$renderer, $.spread_props([
						args,
						{
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							}
						}
					]));
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Input', id: 'inputStory' });
		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Filled variant',
			id: 'inputFilledStory',
			args: { variant: 'filled' }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Unstyled variant',
			id: 'inputUnstyledStory',
			args: { variant: 'unstyled' }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Number value',
			id: 'inputNumberStory',
			children: ($$renderer) => {
				Input($$renderer, {
					type: 'number',
					get value() {
						return valueNumber;
					},

					set value($$value) {
						valueNumber = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> ${$.escape(valueNumber)}
	${$.escape(typeof valueNumber)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Invalid',
			id: 'inputInvalidStory',
			args: { invalid: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Disabled',
			id: 'inputDisabledStory',
			args: { disabled: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'With icon',
			id: 'inputIconStory',
			args: { icon: EnvelopeClosed }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'With icon (slot)',
			id: 'inputIconSlotStory',
			children: ($$renderer) => {
				Input($$renderer, {
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					$$slots: {
						icon: ($$renderer) => {
							{
								EnvelopeClosed($$renderer, {});
							}
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'With right section',
			id: 'inputRightSectionStory',
			children: ($$renderer) => {
				Input($$renderer, {
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					},

					$$slots: {
						rightSection: ($$renderer) => {
							{
								Button($$renderer, {});
							}
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}