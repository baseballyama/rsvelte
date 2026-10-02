import * as $ from 'svelte/internal/server';

export const { data, errors } = { data: {}, errors: {} };

export default function _page($$renderer) {
	$$renderer.push(`<!---->${$.escape(data)}, ${$.escape(errors)}`);
}