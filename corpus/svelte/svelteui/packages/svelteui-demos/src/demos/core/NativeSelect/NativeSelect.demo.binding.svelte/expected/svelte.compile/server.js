import * as $ from 'svelte/internal/server';
import { NativeSelect, Text } from '@svelteuidev/core';

const code = `<script>
    import { NativeSelect, Text } from '@svelteuidev/core';

    let value = 'Svelte';
<\/script>

<NativeSelect
    data={['Svelte', 'React', 'Vue', 'Angular']}
    bind:value
    label="What is the best framework?"
/>
<Text>The best is <Text root="span" inline variant="gradient">{value}</Text></Text>`;

export const type = 'demo';
export const configuration = { code };

export default function NativeSelect_demo_binding($$renderer) {
	let value = 'Svelte';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		NativeSelect($$renderer, {
			data: ['Svelte', 'React', 'Vue', 'Angular'],
			override: { select: { padding: 0 } },
			label: 'What is the best framework?',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Text($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->The best is `);

				Text($$renderer, {
					root: 'span',
					inline: true,
					variant: 'gradient',
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(value)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
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