import * as $ from 'svelte/internal/server';

export default function Hr($$renderer, $$props) {
	const { $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<hr${$.attributes({ class: 'hr', ...rest })}/>`);
}