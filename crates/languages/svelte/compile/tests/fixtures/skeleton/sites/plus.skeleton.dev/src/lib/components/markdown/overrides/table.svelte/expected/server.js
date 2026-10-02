import * as $ from 'svelte/internal/server';

export default function Table($$renderer, $$props) {
	const { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<div class="table-wrap"><table${$.attributes({ class: 'table', ...rest })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></table></div>`);
}