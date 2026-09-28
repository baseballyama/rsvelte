import * as $ from 'svelte/internal/server';
import { Group, NumberInput } from '@svelteuidev/core';

const code = `
<script>
    import { NumberInput } from '@svelteuidev/core';
<\/script>

<NumberInput
    label='Price'
    defaultValue={1000}
    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
    formatter={(value) =>
        !Number.isNaN(parseFloat(value))
        ? ("$ " + value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        : '$ '
    }
\/>
`;

export const type = 'demo';
export const configuration = { code };

export default function NumberInput_demo_parser($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				NumberInput($$renderer, {
					label: 'Price',
					defaultValue: 1000,
					parser: (value) => value.replace(/\$\s?|(,*)/g, ''),
					formatter: (value) => !Number.isNaN(parseFloat(value))
						? ('$ ' + value).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
						: '$ '
				});
			},
			$$slots: { default: true }
		});
	});
}