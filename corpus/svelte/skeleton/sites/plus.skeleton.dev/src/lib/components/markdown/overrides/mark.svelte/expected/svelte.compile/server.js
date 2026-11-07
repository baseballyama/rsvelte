import * as $ from 'svelte/internal/server';

export default function Mark($$renderer, $$props) {
	const { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<mark${$.attributes({ class: 'mark', ...rest })}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></mark>`);
}