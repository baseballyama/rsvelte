import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { count = 0 } = $$props;

	$$renderer.push(`<p>${$.escape(count)}</p>`);
	$.bind_props($$props, { count });
}