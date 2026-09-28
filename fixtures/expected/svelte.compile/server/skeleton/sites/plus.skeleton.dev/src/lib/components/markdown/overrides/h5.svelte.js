import * as $ from 'svelte/internal/server';

export default function H5($$renderer, $$props) {
	const { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<h5${$.attributes({ class: 'h5', ...rest })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></h5>`);
}