import * as $ from 'svelte/internal/server';
import { Switch } from "bits-ui";

export default function Switch_test($$renderer, $$props) {
	let { checked = false, $$slots, $$events, ...restProps } = $$props;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<main><button data-testid="binding">${$.escape(checked)}</button> `);

		if (Switch.Root) {
			$$renderer.push('<!--[-->');

			Switch.Root($$renderer, $.spread_props([
				{ 'aria-label': 'airplane mode', 'data-testid': 'root' },
				restProps,
				{
					get checked() {
						return checked;
					},

					set checked($$value) {
						checked = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Switch.Thumb) {
							$$renderer.push('<!--[-->');
							Switch.Thumb($$renderer, { 'data-testid': 'thumb' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
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