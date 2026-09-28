import * as $ from 'svelte/internal/server';
import { Progress, Space, Group, Button } from '@svelteuidev/core';

const code = `
<Progress tween bind:value />
`;

export const type = 'demo';
export const configuration = { code };

export default function Progress_demo_tween($$renderer) {
	let value = 10;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Progress($$renderer, {
			tween: true,
			size: 'lg',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		Space($$renderer, { h: 'lg' });
		$$renderer.push(`<!----> `);

		Group($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Increment`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Decrement`);
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