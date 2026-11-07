import * as $ from 'svelte/internal/server';

export default function H6($$renderer, $$props) {
	const { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<h6${$.attributes({ class: 'h6', ...rest })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></h6>`);
}