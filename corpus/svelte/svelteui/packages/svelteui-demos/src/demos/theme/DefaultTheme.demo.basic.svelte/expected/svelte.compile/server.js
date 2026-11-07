import * as $ from 'svelte/internal/server';
import { Button, SimpleGrid } from '@svelteuidev/core';

const code = `
<script>
  import { Button } from '@svelteuidev/core';

  const colors = ['dark', 'gray', 'red', 'pink', 'grape', 'violet', 'indigo', 'blue', 'cyan', 'teal', 'green', 'lime', 'yellow', 'orange'];
<\/script>

{#each colors as color}
	<Button {color}>{color}600</Button>
{/each}
`;

export const type = 'demo';
export const configuration = { code };

export default function DefaultTheme_demo_basic($$renderer) {
	const colors = [
		'dark',
		'gray',
		'red',
		'pink',
		'grape',
		'violet',
		'indigo',
		'blue',
		'cyan',
		'teal',
		'green',
		'lime',
		'yellow',
		'orange'
	];

	SimpleGrid($$renderer, {
		class: 'grid',
		cols: 3,
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(colors);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let color = each_array[$$index];

				Button($$renderer, {
					color,
					children: ($$renderer) => {
						$$renderer.push(`<!---->${$.escape(color)}600`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}