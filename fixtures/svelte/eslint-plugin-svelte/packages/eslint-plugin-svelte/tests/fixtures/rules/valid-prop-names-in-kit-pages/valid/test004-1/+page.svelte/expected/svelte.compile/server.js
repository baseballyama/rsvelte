import * as $ from 'svelte/internal/server';

export const { data2: data, errors2: errors } = { data2: {}, errors2: {} };

export default function _page($$renderer) {
	$$renderer.push(`<!---->${$.escape(data)}, ${$.escape(errors)}`);
}