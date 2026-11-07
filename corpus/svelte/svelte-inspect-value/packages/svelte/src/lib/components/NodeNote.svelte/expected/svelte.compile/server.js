import * as $ from 'svelte/internal/server';

export default function NodeNote($$renderer, $$props) {
	let { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<span${$.attributes({ 'data-testid': 'note', ...rest }, 'svelte-1e8qtma')}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></span>`);
}