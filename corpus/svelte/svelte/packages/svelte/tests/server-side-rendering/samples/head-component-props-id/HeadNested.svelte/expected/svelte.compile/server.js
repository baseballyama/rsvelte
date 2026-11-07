import * as $ from 'svelte/internal/server';

export default function HeadNested($$renderer) {
	const id = $.props_id($$renderer);

	$$renderer.push(`<meta name="id"${$.attr('content', id)}/>`);
}