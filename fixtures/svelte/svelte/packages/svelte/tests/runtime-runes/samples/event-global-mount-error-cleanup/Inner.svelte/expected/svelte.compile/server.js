import * as $ from 'svelte/internal/server';

export default function Inner($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		throw new Error('boom');
	});
}