import * as $ from 'svelte/internal/server';

export default function Nested($$renderer) {
	$.head('16v3bot', $$renderer, ($$renderer) => {
		$$renderer.push(`${$.html('<meta name="nested_html" content="nested_html">')} <meta name="nested" content="nested"/>`);
	});
}