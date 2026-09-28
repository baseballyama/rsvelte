import * as $ from 'svelte/internal/server';

export default function Steps($$renderer, $$props) {
	let { children, $$slots, $$events, ...restProps } = $$props;

	$$renderer.push(`<div${$.attributes({
		class: '[&amp;>h3]:step mb-12 ml-4 border-l pl-8 [counter-reset:step]',
		...restProps
	})}>`);

	children?.($$renderer);
	$$renderer.push(`<!----></div>`);
}