import * as $ from 'svelte/internal/server';

export default function Loading($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { params } = $$props;

		$$renderer.push(`<h2>Loading…</h2> <p>We're loading the route! Please wait 5 seconds.</p> <p>Here's your message: ${$.escape(params && params.message)}</p>`);
	});
}