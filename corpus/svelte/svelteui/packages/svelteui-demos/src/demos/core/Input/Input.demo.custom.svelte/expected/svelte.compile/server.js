import * as $ from 'svelte/internal/server';
import { Input } from '@svelteuidev/core';

const code = `<script>
    import { Input } from '@svelteuidev/core';
<\/script>

<Input root="button">Button input</Input>
<Input root="select">
    <option value="1">1</option>
    <option value="2">2</option>
</Input>`;

export const type = 'demo';
export const configuration = { code };

export default function Input_demo_custom($$renderer) {
	Input($$renderer, {
		root: 'button',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Button input`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Input($$renderer, {
		root: 'select',
		children: ($$renderer) => {
			$$renderer.option({ value: '1' }, ($$renderer) => {
				$$renderer.push(`1`);
			});

			$$renderer.push(` `);

			$$renderer.option({ value: '2' }, ($$renderer) => {
				$$renderer.push(`2`);
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}