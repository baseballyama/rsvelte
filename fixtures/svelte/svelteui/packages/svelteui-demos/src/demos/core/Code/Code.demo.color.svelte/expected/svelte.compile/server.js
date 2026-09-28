import * as $ from 'svelte/internal/server';
import { Code, Group } from '@svelteuidev/core';

const code = `<script>
    import { Code } from '@svelteuidev/core';
<\/script>

<Code color="red">This code is red</Code>
<Code color="teal">This code is teal</Code>
<Code color="blue">This code is blue</Code>
`;

export const type = 'demo';
export const configuration = { code };

export default function Code_demo_color($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(['red', 'teal', 'blue']);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let color = each_array[$$index];

				Code($$renderer, {
					color,
					children: ($$renderer) => {
						$$renderer.push(`<!---->This code is ${$.escape(color)}`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}