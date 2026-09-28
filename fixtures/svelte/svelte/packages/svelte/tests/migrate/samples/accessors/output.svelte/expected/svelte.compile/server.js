import * as $ from 'svelte/internal/server';

export default function Output($$renderer, $$props) {
	let { count = 0, stuff, cool } = $$props;

	$$renderer.push(`<button>`);
	cool?.($$renderer);
	$$renderer.push(`<!----></button>`);
	$.bind_props($$props, { count, stuff });
}