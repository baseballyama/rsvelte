import * as $ from 'svelte/internal/server';

export default function _page($$renderer, $$props) {
	let { data, children } = $$props;

	$$renderer.push(`<!---->${$.escape(data)}`);
}