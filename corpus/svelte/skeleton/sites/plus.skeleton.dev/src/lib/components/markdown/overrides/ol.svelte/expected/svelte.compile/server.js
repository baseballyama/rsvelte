import * as $ from 'svelte/internal/server';

export default function Ol($$renderer, $$props) {
	const { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<ol${$.attributes({ class: 'list-decimal list-outside pl-4 space-y-1', ...rest })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></ol>`);
}