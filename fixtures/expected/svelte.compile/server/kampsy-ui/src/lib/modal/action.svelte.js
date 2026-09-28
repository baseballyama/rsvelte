import * as $ from 'svelte/internal/server';
import Button from "$lib/button/button.svelte";

export default function Action($$renderer, $$props) {
	let { children, $$slots, $$events, ...rest } = $$props;

	if (children) {
		$$renderer.push('<!--[0-->');

		Button($$renderer, $.spread_props([
			rest,
			{
				children: ($$renderer) => {
					children($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}