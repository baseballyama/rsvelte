import * as $ from 'svelte/internal/server';

export default function H4($$renderer, $$props) {
	const { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<h4${$.attributes({ class: 'h4', ...rest })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></h4>`);
}