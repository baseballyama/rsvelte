import * as $ from 'svelte/internal/server';

export default function Child($$renderer) {
	const id = $.props_id($$renderer);

	$$renderer.push(`<p>${$.escape(id)}</p>`);
}