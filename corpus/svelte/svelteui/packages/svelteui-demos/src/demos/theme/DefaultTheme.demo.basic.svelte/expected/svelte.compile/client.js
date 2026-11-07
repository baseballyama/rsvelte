import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

export default function DefaultTheme_demo_basic($$anchor) {
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

	SimpleGrid($$anchor, {
		class: 'grid',
		cols: 3,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.each(node, 17, () => colors, $.index, ($$anchor, color) => {
				Button($$anchor, {
					get color() {
						return $.get(color);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, `${$.get(color) ?? ''}600`));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}