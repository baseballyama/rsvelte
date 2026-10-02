import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { EnvelopeClosed } from 'radix-icons-svelte';
import { NumberInput } from './index';

export default function NumberInput_stories($$renderer) {
	Meta($$renderer, { title: 'Components/NumberInput', component: NumberInput });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				NumberInput($$renderer, $.spread_props([args]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'NumberInput', id: 'numberInputStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Decimals',
		id: 'numberInputDecimalsStory',
		args: { precision: 0.01, step: 0.01 }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'With icon',
		id: 'numberInputIconStory',
		args: {
			label: 'Price',
			placeholder: 'Your price',
			icon: EnvelopeClosed
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'With icon (slot)',
		id: 'numbertInputIconSlotStory',
		children: ($$renderer) => {
			NumberInput($$renderer, {
				label: 'Price',
				placeholder: 'Your price',
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

	$$renderer.push(`<!---->`);
}