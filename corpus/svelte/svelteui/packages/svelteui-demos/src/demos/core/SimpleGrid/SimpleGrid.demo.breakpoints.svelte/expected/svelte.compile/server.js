import * as $ from 'svelte/internal/server';
import { Center, SimpleGrid } from '@svelteuidev/core';

const code = `<script>
	import { SimpleGrid } from '@svelteuidev/core';
<\/script>

<SimpleGrid
    breakpoints={[
        { maxWidth: 980, cols: 3, spacing: 'md' },
        { maxWidth: 755, cols: 2, spacing: 'sm' },
        { maxWidth: 600, cols: 1, spacing: 'sm' }
    ]}
    cols={3}
>
    <div>1</div>
    <div>2</div>
    <div>3</div>
    <div>4</div>
    <div>5</div>
</SimpleGrid>
`;

export const type = 'demo';
export const configuration = { code };

export default function SimpleGrid_demo_breakpoints($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		SimpleGrid($$renderer, {
			breakpoints: [
				{ maxWidth: 980, cols: 3, spacing: 'md' },
				{ maxWidth: 755, cols: 2, spacing: 'sm' },
				{ maxWidth: 600, cols: 1, spacing: 'sm' }
			],
			cols: 3,
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like([...Array(5).keys()]);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let _ = each_array[i];

					Center($$renderer, {
						override: { bc: 'AliceBlue', padding: '$12', color: '$blue600' },
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(i + 1)}`);
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}