import * as $ from 'svelte/internal/server';

export default function Code($$renderer, $$props) {
	const { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<code${$.attributes({ class: 'code', ...rest })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></code>`);
}