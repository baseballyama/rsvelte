import * as $ from 'svelte/internal/server';

export default function Head($$renderer) {
	$.head('8arnqj', $$renderer, ($$renderer) => {
		$$renderer.push(`<meta name="test" content="value"/>`);
	});
}