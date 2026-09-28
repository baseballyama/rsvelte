import * as $ from 'svelte/internal/server';

export default function Sub($$renderer, $$props) {
	let count = 0;
	let doubled = $.derived(() => count * 2);

	$$renderer.push(`<!---->${$.escape(count)}
${$.escape(doubled())}`);

	$.bind_props($$props, { count, doubled });
}