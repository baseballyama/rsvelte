import * as $ from 'svelte/internal/server';
import { Toggle } from "bits-ui";

export default function Toggle_test($$renderer, $$props) {
	let { pressed = false, $$slots, $$events, ...restProps } = $$props;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main><button data-testid="binding">${$.escape(pressed)}</button> `);

		if (Toggle.Root) {
			$$renderer.push('<!--[-->');

			Toggle.Root($$renderer, $.spread_props([
				{ 'aria-label': 'toggle', 'data-testid': 'root' },
				restProps,
				{
					get pressed() {
						return pressed;
					},

					set pressed($$value) {
						pressed = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						$$renderer.push(`<!---->a`);
					},
					$$slots: { default: true }
				}
			]));

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</main>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}