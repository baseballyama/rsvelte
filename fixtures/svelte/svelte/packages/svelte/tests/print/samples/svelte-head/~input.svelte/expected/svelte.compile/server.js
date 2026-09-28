import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.head('m1jztp', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Hello world!</title>`);
		});

		$$renderer.push(`<meta name="description" content="This is where the description goes for SEO"/>`);
	});
}