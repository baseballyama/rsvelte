import * as $ from 'svelte/internal/server';

export default function Group($$renderer, $$props) {
	let { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<kbd${$.attributes({ class: 'inline-flex items-center gap-1', ...rest })}>`);
	children($$renderer);
	$$renderer.push(`<!----></kbd>`);
}