import * as $ from 'svelte/internal/server';
import Context from './components/Context/Context.svelte';

export default function Canvas($$renderer, $$props) {
	let { children, $$slots, $$events, ...rest } = $$props;
	let canvas = void 0;
	let dom = void 0;

	$$renderer.push(`<div class="svelte-x6cza5"><canvas class="svelte-x6cza5">`);

	if (canvas && dom) {
		$$renderer.push('<!--[0-->');

		Context($$renderer, $.spread_props([
			{ dom, canvas },
			rest,
			{
				children: ($$renderer) => {
					children?.($$renderer);
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			}
		]));
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--></canvas></div>`);
}