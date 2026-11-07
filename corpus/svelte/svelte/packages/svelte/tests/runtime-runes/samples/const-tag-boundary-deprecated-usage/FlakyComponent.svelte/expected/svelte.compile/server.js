import * as $ from 'svelte/internal/server';

export default function FlakyComponent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		throw new Error();
	});
}