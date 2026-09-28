import * as $ from 'svelte/internal/server';

export default function Nested($$renderer) {
	let text = 'foo';

	$.head('16mh0wj', $$renderer, ($$renderer) => {
		$$renderer.push(`${$.html('<meta name="nested_html" content="nested_html">')} <meta name="nested" content="nested"/> <meta name="foo"${$.attr('content', text)}/>`);
	});
}