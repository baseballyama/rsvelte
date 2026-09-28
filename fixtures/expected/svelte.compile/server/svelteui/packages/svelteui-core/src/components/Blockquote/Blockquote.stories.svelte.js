import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Blockquote } from './index';
import { Center } from '../Center/index';
import { EnvelopeClosed } from 'radix-icons-svelte';

export default function Blockquote_stories($$renderer) {
	const text = `Money is just one thing, folks. There's a lot of other one things that are everything. There's
		also that one thing that's a one thing so special you'd give every other one thing to save that
		one thing and be lost without that one thing. And if you lost that one thing, you'd be left with
		nothing. A nothing so empty and cold that all the other one things will mean nothing.`;

	Meta($$renderer, { title: 'Components/Blockquote', component: Blockquote });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Center($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div style="max-width: 600px;">`);

						Blockquote($$renderer, $.spread_props([
							args,
							{
								children: ($$renderer) => {
									$$renderer.push(`<!---->Money is just one thing, folks. There's a lot of other one things that are everything. There's
		also that one thing that's a one thing so special you'd give every other one thing to save that
		one thing and be lost without that one thing. And if you lost that one thing, you'd be left with
		nothing. A nothing so empty and cold that all the other one things will mean nothing.`);
								},

								$$slots: {
									default: true,
									cite: ($$renderer) => {
										{
											$$renderer.push(`- Corey Riffin`);
										}
									}
								}
							}
						]));

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Default',
		id: 'blockquoteStory',
		args: { iconSize: 20 }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'No Icon',
		id: 'blockquoteNoIconStory',
		args: { icon: null }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Custom Icon',
		id: 'blockquoteCustomIconStory',
		args: { icon: EnvelopeClosed }
	});

	$$renderer.push(`<!---->`);
}